import React, { useEffect, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { useIndoor } from "../data/IndoorContext";
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature';
import { LineString, Position } from 'geojson';
import { EntryPointType, GraphNode, Graph } from '../interfaces/IndoorGraph';

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

const heuristic = (a: GraphNode, b: GraphNode): number => {
  // Base distance
  const baseDistance = distance(a.position, b.position);
  
  // Add penalty for edge nodes to discourage wall-hugging paths
  const edgePenalty = a.isEdgeNode ? 0.00002 : 0;
  
  return baseDistance + edgePenalty;
};

// Modified distance calculation to add wall penalties
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
  // Create a denser grid of points throughout the corridor
  const centerline: Position[] = [];
  
  // Calculate the centroid of the polygon
  const centroid = calculatePolygonCentroid(coordinates);
  
  // Create a grid of points inside the polygon
  // First, find the bounding box of the polygon
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  coordinates.forEach(coord => {
    minX = Math.min(minX, coord[0]);
    minY = Math.min(minY, coord[1]);
    maxX = Math.max(maxX, coord[0]);
    maxY = Math.max(maxY, coord[1]);
  });
  
  // Create a grid within the bounding box
  // Adjust these values to control grid density
  const gridDensityX = 5; 
  const gridDensityY = 5;
  
  const stepX = (maxX - minX) / gridDensityX;
  const stepY = (maxY - minY) / gridDensityY;
  
  // Simple point-in-polygon check (ray casting algorithm)
  const isPointInPolygon = (point: Position, polygon: Position[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      
      const intersect = ((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };
  
  // Generate the grid points
  for (let i = 0; i <= gridDensityX; i++) {
    for (let j = 0; j <= gridDensityY; j++) {
      const x = minX + i * stepX;
      const y = minY + j * stepY;
      const point: Position = [x, y];
      
      // Only add points that are inside the polygon
      if (isPointInPolygon(point, coordinates)) {
        centerline.push(point);
      }
    }
  }
  
  // Always include the centroid
  centerline.push(centroid);
  
  // If we somehow ended up with very few points, revert to the old method
  if (centerline.length < 3) {
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
  }
  
  return centerline;
};

// Build a navigation graph from indoor features
const buildNavigationGraph = (features: IndoorFeatureCollection): Graph => {
  const graph: Graph = {
    nodes: {},
    graph: undefined
  };
  
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
  
  // Create nodes along the corridor edges and within the corridor
  corridorPolygons.forEach((corridor, corridorIndex) => {
    // For each corridor polygon, create nodes along the edges
    // Use more edge points for better path finding
    corridor.coordinates[0].forEach((coordinate, pointIndex) => {
      if (pointIndex % 2 === 0) { // Use every 2nd point instead of every 3rd
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
    // Using improved centerline generation for more nodes
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
      
      // Also connect to edge nodes that are nearby to create paths that
      // don't hug the walls as much
      Object.entries(graph.nodes)
        .filter(([id, node]) => 
          id.startsWith(`corridor_${corridorIndex}_edge_`) && 
          distance(node.position, position) < 0.00006 // Slightly larger radius
        )
        .forEach(([id, _]) => {
          // Add bidirectional connections
          graph.nodes[nodeId].neighbors.push(id);
          graph.nodes[id].neighbors.push(nodeId);
        });
    });
  });
  
  // Process rooms and entry points (elevators, escalators, stairs)
  features.forEach((feature, featureIndex) => {
    if (feature.geometry.type === "Polygon" && feature.properties.indoor === "room") {
      // Create a node for each room (using centroid of polygon)
      const roomRef = feature.properties.ref ?? `room_${featureIndex}`;
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
  const connectionRadius = 0.00005;
  
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
        const typeA = nodeA.id.split('_')[2]; // "edge" or "center"
        const typeB = nodeB.id.split('_')[2]; // "edge" or "center"
        
        // Connect edge-to-center nodes more aggressively to create paths
        // that don't hug walls
        if ((typeA === "edge" && typeB === "center") || 
            (typeA === "center" && typeB === "edge") || corridorA === corridorB) {
          nodeA.neighbors.push(nodeB.id);
          nodeB.neighbors.push(nodeA.id);
        }
        // For different corridor sections, be more selective
        else if (dist < 0.00002) {
          nodeA.neighbors.push(nodeB.id);
          nodeB.neighbors.push(nodeA.id);
        }
      }
    }
  }
  
  // This makes the A* algorithm prefer center nodes
  Object.values(graph.nodes).forEach(node => {
    if (node.isCorridor && node.id.includes("_edge_")) {
      node.isEdgeNode = true;
    }
  });
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
    const connectionsToFind = specificRooms.includes(roomNode.roomNumber ?? "") ? 4 : 2;
    
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
    if (specificRooms.includes(roomNode.roomNumber ?? "") && roomNode.neighbors.length === 0) {
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

export const IndoorNavigation: React.FC = () => {
  const { 
    indoorFeatures, 
    currentFloor, 
    destinationRoom, 
    originRoom,
    indoorTransport
  } = useIndoor();
  
  // Store both the path and the floor it belongs to
  const [destinationRoute, setDestinationRoute] = useState<{
    path: LineString | null;
    floor: string | null;
  }>({ path: null, floor: null });
  
  const [originRoute, setOriginRoute] = useState<{
    path: LineString | null;
    floor: string | null;
  }>({ path: null, floor: null });

  // Map indoorTransport string to EntryPointType enum
  const getEntryPointTypeFromTransport = (): EntryPointType => {
    switch(indoorTransport) {
      case "stairs": return EntryPointType.STAIRS;
      case "escalator": return EntryPointType.ESCALATOR;
      case "elevator": return EntryPointType.ELEVATOR;
      default: return EntryPointType.ELEVATOR;
    }
  };
  
  // Clear routes when destination is cleared
  useEffect(() => {
    if (!destinationRoom) {
      setDestinationRoute({ path: null, floor: null });
      setOriginRoute({ path: null, floor: null });
    }
  }, [destinationRoom]);
  
  useEffect(() => {
    if (indoorFeatures.length === 0 || !currentFloor) return;
    if (!destinationRoom) return;

    // Build the navigation graph for the current floor
    const graph = buildNavigationGraph(indoorFeatures);
    
    // Get destination room node
    const targetRoom = destinationRoom?.ref ?? "";
    const endNodeId = targetRoom ? findRoomNode(graph, targetRoom) : null;
    
    // Get origin room node
    const originRoomRef = originRoom?.ref ?? "";
    const startNodeId = originRoomRef ? findRoomNode(graph, originRoomRef) : null;

    // Case 1: Calculate route from entry point to destination (for destination floor)
    if (endNodeId) {
      const entryType = getEntryPointTypeFromTransport();
      const entryNodeId = findEntryPoint(graph, entryType, endNodeId);
      
      if (entryNodeId) {
        const destPath = findPath(graph, entryNodeId, endNodeId);
        if (destPath) {
          setDestinationRoute({
            path: pathToLineString(destPath, graph),
            floor: currentFloor
          });
        } else {
          setDestinationRoute(prev => ({ ...prev, path: null }));
        }
      }
    }

    // Case 2: Calculate route from origin to entry point (for origin floor)
    if (startNodeId) {
      const entryType = getEntryPointTypeFromTransport();
      const entryNodeId = findEntryPoint(graph, entryType, endNodeId ?? undefined);
      
      if (entryNodeId) {
        const originPath = findPath(graph, startNodeId, entryNodeId);
        if (originPath) {
          setOriginRoute({
            path: pathToLineString(originPath, graph),
            floor: currentFloor
          });
        } else {
          setOriginRoute(prev => ({ ...prev, path: null }));
        }
      }
    }
  }, [indoorFeatures, currentFloor, originRoom, destinationRoom, indoorTransport]);
  
  return (
    <>
      {/* Origin route (only show if we're on the origin floor) */}
      {originRoute.path && originRoute.floor === currentFloor && (
        <Mapbox.ShapeSource
          id="origin-route-path"
          shape={{
            type: "Feature",
            geometry: originRoute.path,
            properties: {}
          }}
        >
          <Mapbox.LineLayer
            id="origin-route-line"
            style={{
              lineColor: "#4285F4", 
              lineWidth: 4,
              lineCap: "round",
              lineJoin: "round"
            }}
          />
        </Mapbox.ShapeSource>
      )}
      
      {/* Destination route (only show if we're on the destination floor) */}
      {destinationRoute.path && destinationRoute.floor === currentFloor && (
        <Mapbox.ShapeSource
          id="route-path"
          shape={{
            type: "Feature",
            geometry: destinationRoute.path,
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
  
  useEffect(() => {
    // When exiting floor view, clear indoor navigation data
    if (!inFloorView) {
      // Clear indoor room selections when exiting floor view
      setOriginRoom(null);
      setDestinationRoom(null);
    }
  }, [inFloorView]);

  if (!inFloorView || indoorFeatures.length === 0) return null;
  
  return <IndoorNavigation />;

  
};

export {
  findPath,
  buildNavigationGraph,
  findEntryPoint,
  findRoomNode,
  pathToLineString
};
