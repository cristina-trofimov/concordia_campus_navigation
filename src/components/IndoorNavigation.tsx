import React, { useEffect, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { useIndoor } from "../data/IndoorContext";
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature';
import { FeatureCollection, LineString, Position } from 'geojson';

// Define types for our graph
interface GraphNode {
  id: string;
  position: Position; // [longitude, latitude]
  neighbors: string[];
  isElevator?: boolean;
  isRoom?: boolean;
  roomNumber?: string;
  isCorridor?: boolean;
}

interface Graph {
  nodes: { [id: string]: GraphNode };
}

// A* pathfinding algorithm
const findPath = (
  graph: Graph,
  startNodeId: string,
  endNodeId: string
): string[] | null => {
  // Priority queue for A* algorithm
  const openSet: { id: string; fScore: number }[] = [];
  const closedSet = new Set<string>();
  
  // Tracking maps
  const gScore: { [id: string]: number } = {}; // Cost from start to current
  const fScore: { [id: string]: number } = {}; // Estimated total cost (g + h)
  const cameFrom: { [id: string]: string } = {}; // Path reconstruction
  
  // Initialize scores
  Object.keys(graph.nodes).forEach(nodeId => {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  });
  
  gScore[startNodeId] = 0;
  fScore[startNodeId] = heuristic(graph.nodes[startNodeId], graph.nodes[endNodeId]);
  openSet.push({ id: startNodeId, fScore: fScore[startNodeId] });
  
  while (openSet.length > 0) {
    // Sort by fScore and get the node with lowest value
    openSet.sort((a, b) => a.fScore - b.fScore);
    const current = openSet.shift()!.id;
    
    // If we've reached the goal
    if (current === endNodeId) {
      return reconstructPath(cameFrom, current);
    }
    
    closedSet.add(current);
    
    // Check all neighbors
    for (const neighborId of graph.nodes[current].neighbors) {
      if (closedSet.has(neighborId)) continue;
      
      // Calculate tentative gScore
      const tentativeGScore = gScore[current] + distance(
        graph.nodes[current].position,
        graph.nodes[neighborId].position
      );
      
      // If this path is better than any previous one
      if (tentativeGScore < gScore[neighborId]) {
        cameFrom[neighborId] = current;
        gScore[neighborId] = tentativeGScore;
        fScore[neighborId] = gScore[neighborId] + heuristic(
          graph.nodes[neighborId],
          graph.nodes[endNodeId]
        );
        
        // Add to open set if not already there
        if (!openSet.some(node => node.id === neighborId)) {
          openSet.push({ id: neighborId, fScore: fScore[neighborId] });
        }
      }
    }
  }
  
  // No path found
  return null;
};

// Heuristic function for A* (Euclidean distance)
const heuristic = (a: GraphNode, b: GraphNode): number => {
  return distance(a.position, b.position);
};

// Distance calculation (Euclidean)
const distance = (posA: Position, posB: Position): number => {
  const dx = posA[0] - posB[0];
  const dy = posA[1] - posB[1];
  return Math.sqrt(dx * dx + dy * dy);
};

// Reconstruct path from cameFrom map
const reconstructPath = (cameFrom: { [id: string]: string }, current: string): string[] => {
  const totalPath = [current];
  while (cameFrom[current]) {
    current = cameFrom[current];
    totalPath.unshift(current);
  }
  return totalPath;
};

// Calculate centroid of a polygon
const calculatePolygonCentroid = (coordinates: Position[]): Position => {
  let sumX = 0;
  let sumY = 0;
  coordinates.forEach(coord => {
    sumX += coord[0];
    sumY += coord[1];
  });
  return [sumX / coordinates.length, sumY / coordinates.length];
};

// Get a centerline through a polygon (simplified approach)
const getCenterline = (coordinates: Position[]): Position[] => {
  // For simplicity, create a line through several key points in the polygon
  const centerline: Position[] = [];
  
  // Calculate the centroid of the polygon
  const centroid = calculatePolygonCentroid(coordinates);
  
  // Select several points along the polygon edges at regular intervals
  const numPoints = Math.min(coordinates.length, 6); // Use up to 6 points
  const step = Math.floor(coordinates.length / numPoints);
  
  // Create points that go from edge points toward the centroid
  for (let i = 0; i < coordinates.length; i += step) {
    // Create a point that's 70% of the way from the edge to the centroid
    const edgePoint = coordinates[i];
    const midPoint: Position = [
      edgePoint[0] * 0.3 + centroid[0] * 0.7,
      edgePoint[1] * 0.3 + centroid[1] * 0.7
    ];
    centerline.push(midPoint);
  }
  
  // Add the centroid itself
  centerline.push(centroid);
  
  return centerline;
};

// Build a navigation graph from indoor features with explicit corridor paths
const buildNavigationGraph = (features: IndoorFeatureCollection): Graph => {
  const graph: Graph = { nodes: {} };
  
  // First, extract the corridor polygons
  const corridorPolygons: {coordinates: Position[][]; id: number}[] = [];
  
  features.forEach((feature, featureIndex) => {
    if (feature.geometry.type === "Polygon" && feature.properties.indoor === "corridor") {
      corridorPolygons.push({
        coordinates: feature.geometry.coordinates,
        id: featureIndex
      });
    }
  });
  
  console.log(`Found ${corridorPolygons.length} corridor polygons`);
  
  // Create nodes along the corridor edges and within the corridor
  corridorPolygons.forEach((corridor, corridorIndex) => {
    // For each corridor polygon, create nodes along the edges
    corridor.coordinates[0].forEach((coordinate, pointIndex) => {
      if (pointIndex % 3 === 0) { // Only use every 3rd point to reduce density
        const nodeId = `corridor_${corridorIndex}_edge_${pointIndex}`;
        graph.nodes[nodeId] = {
          id: nodeId,
          position: coordinate,
          neighbors: [],
          isCorridor: true
        };
      }
    });
    
    // Add nodes along a line through the center of the corridor
    const centerline = getCenterline(corridor.coordinates[0]);
    centerline.forEach((position, pointIndex) => {
      const nodeId = `corridor_${corridorIndex}_center_${pointIndex}`;
      graph.nodes[nodeId] = {
        id: nodeId,
        position,
        neighbors: [],
        isCorridor: true
      };
      
      // Connect to previous center node
      if (pointIndex > 0) {
        const prevNodeId = `corridor_${corridorIndex}_center_${pointIndex-1}`;
        graph.nodes[nodeId].neighbors.push(prevNodeId);
        graph.nodes[prevNodeId].neighbors.push(nodeId);
      }
    });
  });
  
  // Create nodes for rooms based on actual data
  features.forEach((feature, featureIndex) => {
    if (feature.geometry.type === "Polygon" && feature.properties.indoor === "room") {
      // Create a node for each room (using centroid of polygon)
      const nodeId = `room_${feature.properties.ref || featureIndex}`;
      const centroid = calculatePolygonCentroid(feature.geometry.coordinates[0]);
      
      graph.nodes[nodeId] = {
        id: nodeId,
        position: centroid,
        neighbors: [],
        isRoom: true,
        roomNumber: feature.properties.ref as string,
      };
    }
    else if (feature.geometry.type === "Polygon" && 
             (feature.properties.highway === "elevator" || 
              feature.properties.highway === "steps")) {
      // Identify elevators and stairs
      const centroid = calculatePolygonCentroid(feature.geometry.coordinates[0]);
      const nodeId = `elevator_${featureIndex}`;
      
      graph.nodes[nodeId] = {
        id: nodeId,
        position: centroid,
        neighbors: [],
        isElevator: true,
      };
    }
  });
  
  // Explicitly add the main elevator
  const elevatorNodeId = "elevator_main";
  graph.nodes[elevatorNodeId] = {
    id: elevatorNodeId,
    position: [-73.57872, 45.49731],
    neighbors: [],
    isElevator: true
  };
  
  // Connect corridor nodes to each other based on proximity
  connectCorridorNodes(graph);
  
  // Connect rooms to nearby corridor nodes
  connectRoomsToNearestCorridorNode(graph);
  
  // Connect elevators to corridor
  connectElevatorsToCorridors(graph);
  
  return graph;
};

// Connect corridor nodes based on real corridor geometries
const connectCorridorNodes = (graph: Graph): void => {
  const corridorNodes = Object.values(graph.nodes).filter(node => node.isCorridor);
  
  // Connect nearby corridor nodes to create a network
  const connectionRadius = 0.00007; // Slightly larger radius to ensure connectivity
  
  // Connect nodes that are close to each other
  for (let i = 0; i < corridorNodes.length; i++) {
    const nodeA = corridorNodes[i];
    for (let j = i + 1; j < corridorNodes.length; j++) {
      const nodeB = corridorNodes[j];
      
      // Calculate the distance between nodes
      const dist = distance(nodeA.position, nodeB.position);
      
      // Connect if within radius
      if (dist < connectionRadius) {
        // Check if they're from the same corridor section
        const corridorA = nodeA.id.split('_')[1];
        const corridorB = nodeB.id.split('_')[1];
        
        // Only connect if distance is very small or they're from the same corridor
        if (dist < 0.00003 || corridorA === corridorB) {
          nodeA.neighbors.push(nodeB.id);
          nodeB.neighbors.push(nodeA.id);
        }
      }
    }
  }
};

// Connect rooms to nearest corridor nodes based on actual corridor paths
const connectRoomsToNearestCorridorNode = (graph: Graph): void => {
  // Get all room nodes and corridor nodes
  const roomNodes = Object.values(graph.nodes).filter(node => node.isRoom);
  const corridorNodes = Object.values(graph.nodes).filter(node => node.isCorridor);
  
  // Special connections for important rooms like elevators and destinations
  const specificRooms = ["825", "820", "817", "831", "843", "862"];
  
  // Connect each room to the closest corridor nodes
  roomNodes.forEach(roomNode => {
    // For specific rooms of interest, find more corridor connections
    const connectionsToFind = specificRooms.includes(roomNode.roomNumber || "") ? 4 : 2;
    
    // Find the closest corridor nodes
    const closestNodes = corridorNodes
      .map(corridorNode => ({
        node: corridorNode,
        dist: distance(roomNode.position, corridorNode.position)
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, connectionsToFind);
    
    // Connect room to closest corridor nodes
    closestNodes.forEach(({ node, dist }) => {
      // Only connect if relatively close
      if (dist < 0.0005) { // Increased radius to ensure connectivity
        roomNode.neighbors.push(node.id);
        node.neighbors.push(roomNode.id);
      }
    });
    
    // Make sure room 825 has good connections
    if (roomNode.roomNumber === "825" && roomNode.neighbors.length === 0) {
      // Force connection to the closest node
      if (closestNodes.length > 0) {
        roomNode.neighbors.push(closestNodes[0].node.id);
        graph.nodes[closestNodes[0].node.id].neighbors.push(roomNode.id);
      }
    }
  });
};

// Connect elevators specifically to corridor nodes
const connectElevatorsToCorridors = (graph: Graph): void => {
  const elevatorNodes = Object.values(graph.nodes).filter(node => node.isElevator);
  const corridorNodes = Object.values(graph.nodes).filter(node => node.isCorridor);
  
  // For each elevator, find the closest corridor nodes
  elevatorNodes.forEach(elevator => {
    // Find the 5 closest corridor nodes
    const closestCorridorNodes = corridorNodes
      .map(corridorNode => ({
        node: corridorNode,
        dist: distance(elevator.position, corridorNode.position)
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);
    
    // Connect to the closest corridor nodes
    closestCorridorNodes.forEach(({ node, dist }) => {
      if (dist < 0.0003) { // Reasonable connection distance
        elevator.neighbors.push(node.id);
        node.neighbors.push(elevator.id);
      }
    });
    
    // For the main elevator, ensure it has connections
    if (elevator.id === "elevator_main" && elevator.neighbors.length === 0) {
      // Force connection to the closest node regardless of distance
      const closest = closestCorridorNodes[0];
      if (closest) {
        elevator.neighbors.push(closest.node.id);
        graph.nodes[closest.node.id].neighbors.push(elevator.id);
      }
    }
  });
};

// Find the closest elevator node
const findClosestElevator = (graph: Graph, elevatorPositions: Position[]): string | null => {
  // Try to find the main elevator node first
  if (graph.nodes["elevator_main"]) {
    return "elevator_main";
  }
  
  // Then look for any elevator nodes
  const elevatorNodes = Object.values(graph.nodes).filter(node => node.isElevator);
  
  if (elevatorNodes.length > 0) {
    return elevatorNodes[0].id;
  }
  
  // If no elevator nodes were found, try to find nodes near known elevator positions
  let closestNode = null;
  let minDist = Infinity;
  
  Object.values(graph.nodes).forEach(node => {
    // Only consider corridor nodes as potential connection points to elevators
    if (!node.isCorridor) return;
    
    // Check against known elevator positions
    elevatorPositions.forEach(elevatorPos => {
      const dist = distance(node.position, elevatorPos);
      if (dist < minDist) {
        minDist = dist;
        closestNode = node.id;
      }
    });
  });
  
  return closestNode;
};

// Find room node by room number
const findRoomNode = (graph: Graph, roomNumber: string): string | null => {
  const roomNode = Object.values(graph.nodes).find(
    node => node.isRoom && node.roomNumber === roomNumber
  );
  return roomNode ? roomNode.id : null;
};

// Convert a path of nodes to a GeoJSON LineString
const pathToLineString = (path: string[], graph: Graph): LineString => {
  const coordinates = path.map(nodeId => graph.nodes[nodeId].position);
  
  return {
    type: "LineString",
    coordinates: coordinates
  };
};

// Main navigation component
export const IndoorNavigation: React.FC = () => {
  const { indoorFeatures, currentFloor, destinationRoom } = useIndoor();
  const [routePath, setRoutePath] = useState<LineString | null>(null);
  const [debugNodes, setDebugNodes] = useState<Position[]>([]);
  
  useEffect(() => {
    if (indoorFeatures.length === 0 || !currentFloor) return;
    
    console.log("Building navigation graph...");
    
    // Build the navigation graph
    const graph = buildNavigationGraph(indoorFeatures);
    
    console.log(`Built graph with ${Object.keys(graph.nodes).length} nodes`);
    
    // Known elevator positions for H8 building
    const elevatorPositions: Position[] = [
      // Main elevator position
      [-73.57872, 45.49731]
    ];
    
    // Debug - collect corridor nodes for visualization
    const corridorNodes: Position[] = Object.values(graph.nodes)
      .filter(node => node.isCorridor)
      .map(node => node.position);
    setDebugNodes(corridorNodes);
    
    // Get starting point (elevator) and destination
    const startNodeId = findClosestElevator(graph, elevatorPositions);
    
    // Either use selected destination room or default to room 825
    const targetRoom = destinationRoom?.ref || "861";
    const endNodeId = findRoomNode(graph, targetRoom);
    
    if (!startNodeId || !endNodeId) {
      console.error(`Could not find ${!startNodeId ? 'elevator' : 'room'} node`);
      return;
    }
    
    console.log(`Finding path from ${startNodeId} to ${endNodeId}`);
    
    // Find the path
    const path = findPath(graph, startNodeId, endNodeId);
    
    if (path) {
      console.log(`Found path with ${path.length} nodes`);
      console.log(`Path: ${path.join(' -> ')}`);
      
      // Convert path to GeoJSON LineString
      const lineString = pathToLineString(path, graph);
      setRoutePath(lineString);
    } else {
      console.error("No path found");
    }
  }, [indoorFeatures, currentFloor, destinationRoom]);
  
  if (!routePath) return null;
  
  return (
    <>
      {/* Main route path */}
      <Mapbox.ShapeSource
        id="route-path"
        shape={{
          type: "Feature",
          geometry: routePath,
          properties: {}
        }}
      >
        <Mapbox.LineLayer
          id="route-line"
          style={{
            lineColor: "#4285F4",
            lineWidth: 4,
            lineCap: "round",
            lineJoin: "round"
          }}
        />
      </Mapbox.ShapeSource>
      
      {/* Debug visualization of corridor nodes */}
      {debugNodes.length > 0 && (
        <Mapbox.ShapeSource
          id="corridor-nodes"
          shape={{
            type: "FeatureCollection",
            features: debugNodes.map((pos, i) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: pos
              },
              properties: { id: i }
            }))
          }}
        >
          <Mapbox.CircleLayer
            id="corridor-node-circles"
            style={{
              circleRadius: 2,
              circleColor: "#00FF00",
              circleOpacity: 0.5
            }}
          />
        </Mapbox.ShapeSource>
      )}
    </>
  );
};

// Helper component to integrate with your HighlightIndoorMap
export const NavigationOverlay: React.FC = () => {
  const { inFloorView, indoorFeatures } = useIndoor();
  
  if (!inFloorView || indoorFeatures.length === 0) return null;
  
  return <IndoorNavigation />;
};