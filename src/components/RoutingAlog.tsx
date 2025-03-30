import { RoomProperties } from '../interfaces/roomProperties';
import { Feature, Polygon, Point } from 'geojson';
import PF from 'pathfinding';

type Geometry = Polygon | Point;
type CC1Features = Feature<Geometry, RoomProperties>;

// Import your existing features
import { cc1Features } from '../data/indoor/CC/CC1';

// Define cleaner interfaces for our graph structure
export interface Node {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  properties: RoomProperties;
  type: 'entrance' | 'room' | 'elevator' | 'corridor' | 'toilets' | 'steps';
}

export interface Graph {
  nodes: Map<string, Node>;
  grid: PF.Grid; // Grid representation for pathfinding
  nodeIndices: Map<string, [number, number]>; // Maps node IDs to grid positions
  gridToNode: Map<string, string>; // Maps grid positions to node IDs
}

// Function to extract centroid of a polygon
function getPolygonCentroid(coordinates: number[][][]): [number, number] {
  const ring = coordinates[0];
  let sumX = 0;
  let sumY = 0;

  for (const point of ring) {
    sumX += point[0];
    sumY += point[1];
  }

  return [sumX / ring.length, sumY / ring.length];
}

// Function to calculate distance between two points (Haversine formula)
function calculateDistance(point1: [number, number], point2: [number, number]): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1[1] * Math.PI / 180; // lat1 in radians
  const φ2 = point2[1] * Math.PI / 180; // lat2 in radians
  const Δφ = (point2[1] - point1[1]) * Math.PI / 180; // lat difference in radians
  const Δλ = (point2[0] - point1[0]) * Math.PI / 180; // lon difference in radians

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // distance in meters

  return distance;
}

// Function to create a graph from GeoJSON features
export function createGraph(features: CC1Features[]): Graph {
  // Step 1: Extract all nodes from features
  const nodes = new Map<string, Node>();
  const nodeCoordinates: Array<[number, number]> = [];
  const nodeIds: string[] = [];

  features.forEach((feature, index) => {
    const properties = feature.properties;
    let nodeType: Node['type'] = 'room';
    let coordinates: [number, number];

    // Generate a unique ID
    let id = properties.ref ? `room_${properties.ref}` : `node_${index}`;

    // Determine node type based on properties
    if (properties.entrance === 'yes') {
      nodeType = 'entrance';
    } else if (properties.highway === 'elevator') {
      nodeType = 'elevator';
    } else if (properties.highway === 'steps') {
      nodeType = 'steps';
    } else if (properties.indoor === 'corridor') {
      nodeType = 'corridor';
    } else if (properties.amenity === 'toilets') {
      nodeType = 'toilets';
    }

    // Get coordinates based on geometry type
    if (feature.geometry.type === 'Point') {
      coordinates = feature.geometry.coordinates as [number, number];
    } else if (feature.geometry.type === 'Polygon') {
      coordinates = getPolygonCentroid(feature.geometry.coordinates);
    } else {
      return; // Skip if geometry type is not supported
    }

    // Create and add node to our collections
    const node: Node = {
      id,
      coordinates,
      properties,
      type: nodeType
    };

    nodes.set(id, node);
    nodeCoordinates.push(coordinates);
    nodeIds.push(id);
  });

  // Step 2: Create a grid for pathfinding
  // First find the bounding box of all coordinates
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  nodeCoordinates.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  // Scale coordinates to integer grid positions
  const GRID_SCALE = 1000; // Scale to get integer grid positions
  const gridWidth = Math.ceil((maxX - minX) * GRID_SCALE) + 2;
  const gridHeight = Math.ceil((maxY - minY) * GRID_SCALE) + 2;

  // Create pathfinding grid
  const grid = new PF.Grid(gridWidth, gridHeight);
  const nodeIndices = new Map<string, [number, number]>();
  const gridToNode = new Map<string, string>();

  // Place nodes in the grid
  nodeIds.forEach((id, index) => {
    const [x, y] = nodeCoordinates[index];

    // Convert to grid coordinates
    const gridX = Math.floor((x - minX) * GRID_SCALE) + 1;
    const gridY = Math.floor((y - minY) * GRID_SCALE) + 1;

    nodeIndices.set(id, [gridX, gridY]);
    gridToNode.set(`${gridX},${gridY}`, id);
  });

  // Step 3: Connect nodes in the grid
  // Make grid walkable only at node positions
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      grid.setWalkableAt(x, y, false);
    }
  }

  // Make node positions walkable
nodeIndices.forEach((position, id) => {
  const [x, y] = position;
  grid.setWalkableAt(x, y, true);
});

  // Connect nodes that are within a reasonable distance
  const MAX_DISTANCE = 30; // meters

for (let i = 0; i < nodeIds.length; i++) {
  for (let j = i + 1; j < nodeIds.length; j++) {
    const node1 = nodes.get(nodeIds[i])!;
    const node2 = nodes.get(nodeIds[j])!;

    // Calculate distance between nodes
    const distance = calculateDistance(node1.coordinates, node2.coordinates);

    // Connect only if within reasonable distance
    if (distance <= MAX_DISTANCE) {
      const [x1, y1] = nodeIndices.get(node1.id)!;
      const [x2, y2] = nodeIndices.get(node2.id)!;

      // Simple approach: connect in a straight line
      const dx = Math.sign(x2 - x1);
      const dy = Math.sign(y2 - y1);

      // Draw a line between points
      let x = x1, y = y1;
      while (x !== x2 || y !== y2) {
        grid.setWalkableAt(x, y, true);

        // Move toward destination
        if (x !== x2) x += dx;
        if (y !== y2) y += dy;
      }
      // Mark the destination as walkable too
      grid.setWalkableAt(x2, y2, true);
    }
  }
}

  // Apply special weights based on node types
  // This is done through a custom heuristic in the findPath function

  return {
    nodes,
    grid,
    nodeIndices,
    gridToNode
  };
}

// Create graph from CC1 features
export const cc1Graph = createGraph(cc1Features);

// Function to find the shortest path between two nodes
export function findPath(startNodeId: string, endNodeId: string): string[] | null {
  console.log(`Attempting to find path from ${startNodeId} to ${endNodeId}`);

  // Check if start and end nodes exist
  if (!cc1Graph.nodes.has(startNodeId) || !cc1Graph.nodes.has(endNodeId)) {
    console.log(`Node missing: startId exists: ${cc1Graph.nodes.has(startNodeId)}, endId exists: ${cc1Graph.nodes.has(endNodeId)}`);
    return null;
  }

  // Get grid positions
  const startPos = cc1Graph.nodeIndices.get(startNodeId);
  const endPos = cc1Graph.nodeIndices.get(endNodeId);

  if (!startPos || !endPos) {
    console.log("Could not find grid positions for nodes");
    return null;
  }

  // Use A* pathfinding
  const finder = new PF.AStarFinder({
    allowDiagonal: true,
    dontCrossCorners: true,
    heuristic: PF.Heuristic.manhattan,
    weight: 1 // Use a weight of 1 for simplicity
  });

  // Find path on grid
  const gridClone = cc1Graph.grid.clone();
  const gridPath = finder.findPath(startPos[0], startPos[1], endPos[0], endPos[1], gridClone);

  if (!gridPath || gridPath.length === 0) {
    console.log("No path found on grid");
    return null;
  }

  // Convert grid path to node IDs
  const nodePath: string[] = [];
  let lastNodeId: string | null = null;

  for (const [x, y] of gridPath) {
    const key = `${x},${y}`;
    const nodeId = cc1Graph.gridToNode.get(key);

    if (nodeId && nodeId !== lastNodeId) {
      nodePath.push(nodeId);
      lastNodeId = nodeId;
    }
  }

  // If path doesn't start with startNodeId, add it at the beginning
  if (nodePath[0] !== startNodeId) {
    nodePath.unshift(startNodeId);
  }

  // If path doesn't end with endNodeId, add it at the end
  if (nodePath[nodePath.length - 1] !== endNodeId) {
    nodePath.push(endNodeId);
  }

  return nodePath;
}

// Function to get node coordinates for visualization
export function getPathCoordinates(path: string[]): [number, number][] {
  return path.map(nodeId => {
    const node = cc1Graph.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found in graph`);
    }
    return node.coordinates;
  });
}

// Function to check graph connectivity
export function checkGraphConnectivity(): string {
  const numNodes = cc1Graph.nodes.size;
  const numWalkable = cc1Graph.grid.nodes.reduce((count, row) => {
    return count + row.reduce((rowCount, cell) => rowCount + (cell.walkable ? 1 : 0), 0);
  }, 0);

  return `Graph has ${numNodes} nodes and ${numWalkable} walkable cells in the grid.`;
}

// Function to check room connections
export function checkRoomConnections(roomId: string): string {
  const node = cc1Graph.nodes.get(roomId);
  if (!node) {
    return `Room ${roomId} does not exist in the graph.`;
  }

  const position = cc1Graph.nodeIndices.get(roomId);
  if (!position) {
    return `Room ${roomId} does not have a grid position.`;
  }

  const [x, y] = position;
  const connections: string[] = [];

  // Check all 8 adjacent cells
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      // Check if position is in grid bounds
      if (nx >= 0 && nx < cc1Graph.grid.width && ny >= 0 && ny < cc1Graph.grid.height) {
        // Check if the cell is walkable
        if (cc1Graph.grid.isWalkableAt(nx, ny)) {
          const nodeKey = `${nx},${ny}`;
          const connectedNodeId = cc1Graph.gridToNode.get(nodeKey);

          if (connectedNodeId && connectedNodeId !== roomId) {
            connections.push(connectedNodeId);
          }
        }
      }
    }
  }

  // Categorize connections by node type
  const connectedRooms = connections
    .filter(id => cc1Graph.nodes.get(id)?.type === 'room')
    .map(id => id);

  const connectedCorridors = connections
    .filter(id => cc1Graph.nodes.get(id)?.type === 'corridor')
    .map(id => id);

  const connectedEntrances = connections
    .filter(id => cc1Graph.nodes.get(id)?.type === 'entrance')
    .map(id => id);

  return `Room ${roomId} is connected to:
  - ${connectedRooms.length} rooms: ${connectedRooms.join(', ')}
  - ${connectedCorridors.length} corridors: ${connectedCorridors.join(', ')}
  - ${connectedEntrances.length} entrances: ${connectedEntrances.join(', ')}`;
}
// Function to convert a path to GeoJSON LineString
export function pathToGeoJSON(path: string[]): GeoJSON.Feature<GeoJSON.LineString> {
  // Get coordinates for each node in the path
  const coordinates = path.map(nodeId => {
    const node = cc1Graph.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found in graph`);
    }
    return node.coordinates;
  });

  // Create GeoJSON LineString
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  };
}