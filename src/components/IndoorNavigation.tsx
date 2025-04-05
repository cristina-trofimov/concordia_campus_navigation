import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useIndoor } from "../data/IndoorContext";
import { useCoords } from "../data/CoordsContext";
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature';
import { FeatureCollection, LineString, Position } from 'geojson';

// Starting points types
export enum EntryPointType {
  ELEVATOR = 'elevator',
  ESCALATOR = 'escalator',
  STAIRS = 'stairs',
  ANY = 'any' // Default - will try all types
}

// Define types for our graph
interface GraphNode {
  id: string;
  position: Position; // [longitude, latitude]
  neighbors: string[];
  isEntryPoint?: boolean;
  entryPointType?: EntryPointType;
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

// Build a navigation graph from indoor features
const buildNavigationGraph = (features: IndoorFeatureCollection): Graph => {
  const graph: Graph = { nodes: {} };
  
  // Extract the corridor polygons
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
  
  // Process rooms and entry points (elevators, escalators, stairs)
  features.forEach((feature, featureIndex) => {
    if (feature.geometry.type === "Polygon" && feature.properties.indoor === "room") {
      // Create a node for each room (using centroid of polygon)
      const roomRef = feature.properties.ref || `room_${featureIndex}`;
      const nodeId = `room_${roomRef}`;
      const centroid = calculatePolygonCentroid(feature.geometry.coordinates[0]);
      
      graph.nodes[nodeId] = {
        id: nodeId,
        position: centroid,
        neighbors: [],
        isRoom: true,
        roomNumber: roomRef as string,
      };
    }
    // Check for entry points (elevators, escalators, stairs)
    else if (feature.geometry.type === "Polygon" && 
             (feature.properties.highway === "elevator" || 
              feature.properties.highway === "steps" || 
              feature.properties.escalators === "yes")) {
      
      // Determine entry point type
      let entryType = EntryPointType.ANY;
      if (feature.properties.highway === "elevator") {
        entryType = EntryPointType.ELEVATOR;
      } else if (feature.properties.highway === "steps") {
        entryType = EntryPointType.STAIRS;
      } else if (feature.properties.escalators === "yes") {
        entryType = EntryPointType.ESCALATOR;
      }
      
      // Create node for the entry point
      const centroid = calculatePolygonCentroid(feature.geometry.coordinates[0]);
      const nodeId = `entrypoint_${entryType}_${featureIndex}`;
      
      graph.nodes[nodeId] = {
        id: nodeId,
        position: centroid,
        neighbors: [],
        isEntryPoint: true,
        entryPointType: entryType
      };
    }
    // Check for point entry points (they might be defined as points)
    else if (feature.geometry.type === "Point" && 
             (feature.properties.highway === "elevator" || 
              feature.properties.entrance === "yes")) {
      
      // For point features, check if they're entry points
      let entryType = EntryPointType.ANY;
      if (feature.properties.highway === "elevator") {
        entryType = EntryPointType.ELEVATOR;
      } else if (feature.properties.entrance === "yes") {
        // Check for other properties that might indicate stairs/escalators
        if (feature.properties.escalators === "yes") {
          entryType = EntryPointType.ESCALATOR;
        } else if (feature.properties.stairs === "yes" || feature.properties.steps === "yes") {
          entryType = EntryPointType.STAIRS;
        }
      }
      
      // Only create if it's a valid entry point
      if (entryType !== EntryPointType.ANY || feature.properties.entrance === "yes") {
        const nodeId = `entrypoint_${entryType}_${featureIndex}`;
        const position = feature.geometry.coordinates;
        
        graph.nodes[nodeId] = {
          id: nodeId,
          position,
          neighbors: [],
          isEntryPoint: true,
          entryPointType: entryType
        };
      }
    }
  });
  
  // Connect corridor nodes to each other
  connectCorridorNodes(graph);
  
  // Connect rooms to corridors
  connectRoomsToCorridors(graph);
  
  // Connect entry points to corridors
  connectEntryPointsToCorridors(graph);
  
  return graph;
};

// Connect corridor nodes based on proximity
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

// Connect rooms to corridors
const connectRoomsToCorridors = (graph: Graph): void => {
  const roomNodes = Object.values(graph.nodes).filter(node => node.isRoom);
  const corridorNodes = Object.values(graph.nodes).filter(node => node.isCorridor);
  
  // Special connections for important rooms
  const specificRooms = ["825", "820", "817", "831", "843", "862", "801"];
  
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
    
    // Ensure important rooms have connections
    if (specificRooms.includes(roomNode.roomNumber || "") && roomNode.neighbors.length === 0) {
      // Force connection to the closest node
      if (closestNodes.length > 0) {
        roomNode.neighbors.push(closestNodes[0].node.id);
        graph.nodes[closestNodes[0].node.id].neighbors.push(roomNode.id);
      }
    }
  });
};

// Connect entry points (elevators/stairs/escalators) to corridors
const connectEntryPointsToCorridors = (graph: Graph): void => {
  const entryPointNodes = Object.values(graph.nodes).filter(node => node.isEntryPoint);
  const corridorNodes = Object.values(graph.nodes).filter(node => node.isCorridor);
  
  // Connect each entry point to multiple corridor nodes
  entryPointNodes.forEach(entryPoint => {
    // Find several closest corridor nodes
    const closestCorridorNodes = corridorNodes
      .map(corridorNode => ({
        node: corridorNode,
        dist: distance(entryPoint.position, corridorNode.position)
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);
    
    // Connect to closest corridor nodes
    closestCorridorNodes.forEach(({ node, dist }) => {
      if (dist < 0.0004) { // Reasonable connection distance
        entryPoint.neighbors.push(node.id);
        node.neighbors.push(entryPoint.id);
      }
    });
    
    // Ensure the entry point has at least one connection
    if (entryPoint.neighbors.length === 0 && closestCorridorNodes.length > 0) {
      const closest = closestCorridorNodes[0];
      entryPoint.neighbors.push(closest.node.id);
      graph.nodes[closest.node.id].neighbors.push(entryPoint.id);
    }
  });
};

// Find an entry point of the specified type that's closest to a destination
const findEntryPoint = (
  graph: Graph,
  entryType: EntryPointType = EntryPointType.ELEVATOR,
  destinationNodeId: string | null = null
): string | null => {
  // First filter entry points by type
  const entryPointsOfType = Object.values(graph.nodes).filter(
    node => node.isEntryPoint && 
    (node.entryPointType === entryType || entryType === EntryPointType.ANY)
  );
  
  // If we have a destination node, find the closest entry point to it
  if (destinationNodeId && entryPointsOfType.length > 0) {
    const destinationNode = graph.nodes[destinationNodeId];
    
    // Sort entry points by distance to destination
    const sortedEntryPoints = entryPointsOfType
      .map(entryPoint => ({
        id: entryPoint.id,
        dist: distance(entryPoint.position, destinationNode.position)
      }))
      .sort((a, b) => a.dist - b.dist);
    
    // Return the closest one
    if (sortedEntryPoints.length > 0) {
      return sortedEntryPoints[0].id;
    }
  } 
  // If no destination or no entry points of the specified type found
  else if (entryPointsOfType.length > 0) {
    return entryPointsOfType[0].id;
  }
  
  // If entry points of the specified type aren't found, try any entry point
  if (entryType !== EntryPointType.ANY) {
    const anyEntryPoints = Object.values(graph.nodes).filter(node => node.isEntryPoint);
    
    if (anyEntryPoints.length > 0) {
      // If we have a destination, find the closest one
      if (destinationNodeId) {
        const destinationNode = graph.nodes[destinationNodeId];
        const sortedEntryPoints = anyEntryPoints
          .map(entryPoint => ({
            id: entryPoint.id,
            dist: distance(entryPoint.position, destinationNode.position)
          }))
          .sort((a, b) => a.dist - b.dist);
        
        if (sortedEntryPoints.length > 0) {
          return sortedEntryPoints[0].id;
        }
      } else {
        return anyEntryPoints[0].id;
      }
    }
  }
  
  // As a last resort, try to find a corridor node
  const corridorNodes = Object.values(graph.nodes).filter(node => node.isCorridor);
  if (corridorNodes.length > 0) {
    return corridorNodes[0].id;
  }
  
  return null;
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
  const { 
    indoorFeatures, 
    currentFloor, 
    destinationRoom, 
    originRoom,
    indoorTransport // Use the transport preference from context
  } = useIndoor();
  const { highlightedBuilding } = useCoords();
  const [routePath, setRoutePath] = useState<LineString | null>(null);
  const [debugNodes, setDebugNodes] = useState<Position[]>([]);
  const [routeFloor, setRouteFloor] = useState<string | null>(null);
  
  // Map indoorTransport string to EntryPointType enum
  const getEntryPointTypeFromTransport = (): EntryPointType => {
    switch(indoorTransport) {
      case "stairs":
        return EntryPointType.STAIRS;
      case "escalator":
        return EntryPointType.ESCALATOR;
      case "elevator":
        return EntryPointType.ELEVATOR;
      default:
        return EntryPointType.ELEVATOR; // Default to elevator if no preference
    }
  };
  
  // Clear route when destination is cleared
  useEffect(() => {
    if (!destinationRoom) {
      setRoutePath(null);
      setRouteFloor(null);
    }
  }, [destinationRoom]);
  
  // Check if we should display the route on the current floor
  const shouldShowRoute = (): boolean => {
    return routePath !== null && currentFloor === routeFloor;
  };
  
  // Clear route when floor changes
  useEffect(() => {
    if (routeFloor && currentFloor !== routeFloor) {
      // Don't clear the stored route, just don't display it
      // We'll keep the calculated route in case user returns to the correct floor
      console.log("Floor changed, hiding route");
    }
  }, [currentFloor]);
  
  useEffect(() => {
    if (indoorFeatures.length === 0 || !currentFloor) return;
    if (!destinationRoom) return; // No destination selected
    
    console.log("Building navigation graph...");
    console.log("Current building:", highlightedBuilding?.properties.id);
    console.log("Current floor:", currentFloor);
    console.log("Transport preference:", indoorTransport);
    
    // Store the floor this route is valid for
    setRouteFloor(currentFloor);
    
    // Build the navigation graph
    const graph = buildNavigationGraph(indoorFeatures);
    
    console.log(`Built graph with ${Object.keys(graph.nodes).length} nodes`);
    
    // Debug - collect corridor nodes for visualization
    const corridorNodes: Position[] = Object.values(graph.nodes)
      .filter(node => node.isCorridor)
      .map(node => node.position);
    setDebugNodes(corridorNodes);
    
    // Log all entry points found
    const entryPoints = Object.values(graph.nodes).filter(node => node.isEntryPoint);
    console.log(`Found ${entryPoints.length} entry points:`, 
      entryPoints.map(ep => `${ep.id} (${ep.entryPointType})`));
    
    // Get destination room first so we can find the closest entry point to it
    const targetRoom = destinationRoom?.ref || "";
    const endNodeId = targetRoom ? findRoomNode(graph, targetRoom) : null;
    
    if (!endNodeId) {
      console.error("Could not find destination node");
      setRoutePath(null);
      return;
    }
    
    // Get starting point - use origin room if available, otherwise use entry point
    let startNodeId: string | null = null;
    
    if (originRoom && originRoom.ref) {
      startNodeId = findRoomNode(graph, originRoom.ref);
      console.log(`Using origin room ${originRoom.ref} as starting point`);
    }
    
    // If origin room not found, use the preferred transport type as starting point
    // Find the one closest to the destination room
    if (!startNodeId) {
      const entryType = getEntryPointTypeFromTransport();
      startNodeId = findEntryPoint(graph, entryType, endNodeId);
      console.log(`Using ${indoorTransport} closest to destination as starting point`);
    }
    
    if (!startNodeId) {
      console.error(`Could not find starting node`);
      setRoutePath(null);
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
      setRoutePath(null);
    }
  }, [indoorFeatures, currentFloor, originRoom, destinationRoom, indoorTransport]);
  
  return (
    <>
      {/* Route path display - only show on the correct floor */}
      {shouldShowRoute() && (
        <Mapbox.ShapeSource
          id="route-path"
          shape={{
            type: "Feature",
            geometry: routePath as LineString,
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
      )}
          
    </>
  );
};

// Helper component to integrate with your HighlightIndoorMap
export const NavigationOverlay: React.FC = () => {
  const { inFloorView, indoorFeatures, setOriginRoom, setDestinationRoom } = useIndoor();
  const { setOriginCoords, setDestinationCoords } = useCoords();
  
  useEffect(() => {
    // When exiting floor view, clear indoor navigation data
    if (!inFloorView) {
      // Clear indoor room selections when exiting floor view
      setOriginRoom(null);
      setDestinationRoom(null);
    }
  }, [inFloorView]);
  
  useEffect(() => {
    // When entering indoor navigation mode, clear outdoor navigation data
    if (inFloorView) {
      // Clear outdoor coordinates to prevent mixed navigation
      setOriginCoords(null);
      setDestinationCoords(null);
    }
  }, [inFloorView]);

  if (!inFloorView || indoorFeatures.length === 0) return null;
  
  return <IndoorNavigation />;

  
};