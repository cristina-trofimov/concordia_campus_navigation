import { Feature, LineString, Point, Polygon } from 'geojson';
import { point, lineString, featureCollection } from '@turf/helpers';
import nearestPoint from '@turf/nearest-point';
import { RoomInfo } from '../interfaces/RoomInfo';
import { featureMap, floorNameFormat } from './IndoorMap';
import { buildingFloorAssociations } from '../data/buildingFloorAssociations';
import { dijkstra, extractPath } from './PathFinding';

// Define an interface for graph nodes
interface GraphNode {
  id: string;
  coordinates: [number, number];
  type: string; // 'room', 'corridor', 'stairs', 'elevator', 'escalator', 'entrance'
  floor: string;
  building: string;
}

// Define an interface for graph edges
interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

// Create a graph from floor features
const createFloorGraph = (buildingId: string, floor: string, component: string): { nodes: GraphNode[], edges: GraphEdge[] } => {
  const floorFeatures = featureMap[component];
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  if (!floorFeatures) return { nodes, edges };

  // First, extract all nodes
  floorFeatures.forEach((feature: any) => {
    // For rooms and other polygon features
    if (feature.geometry.type === 'Polygon') {
      const coordinates = feature.geometry.coordinates[0];
      // Calculate centroid
      let sumX = 0, sumY = 0;
      coordinates.forEach((coord: [number, number]) => {
        sumX += coord[0];
        sumY += coord[1];
      });
      const centroid: [number, number] = [sumX / coordinates.length, sumY / coordinates.length];
      
      // Determine node type
      let type = 'room';
      if (feature.properties.indoor === 'corridor') {
        type = 'corridor';
      } else if (feature.properties.highway === 'elevator') {
        type = 'elevator';
      } else if (feature.properties.highway === 'steps' || feature.properties.highway === 'stairs') {
        type = 'stairs';
      } else if (feature.properties.highway === 'escalator') {
        type = 'escalator';
      }
      
      // Create node id
      const id = `${buildingId}-${floor}-${type}-${feature.properties.ref || nodes.length}`;
      
      nodes.push({
        id,
        coordinates: centroid,
        type,
        floor,
        building: buildingId
      });
    }
    // For entrance points and other point features
    else if (feature.geometry.type === 'Point') {
      const coords = feature.geometry.coordinates;
      let type = 'point';
      
      if (feature.properties.entrance === 'yes') {
        type = 'entrance';
      }
      
      const id = `${buildingId}-${floor}-${type}-${nodes.length}`;
      
      nodes.push({
        id,
        coordinates: coords as [number, number],
        type,
        floor,
        building: buildingId
      });
    }
  });

  // Create edges between nodes
  // This is a simplified approach where we connect:
  // 1. All rooms to nearest corridor node
  // 2. All corridor nodes to each other (if they're close enough)
  // 3. Connect vertical transportation (stairs, elevators) to nearest corridor nodes
  
  // First, identify corridor nodes
  const corridorNodes = nodes.filter(node => node.type === 'corridor');
  const roomNodes = nodes.filter(node => node.type === 'room');
  const transportNodes = nodes.filter(node => 
    ['stairs', 'elevator', 'escalator', 'entrance'].includes(node.type)
  );

  // Connect rooms to nearest corridor
  roomNodes.forEach(roomNode => {
    if (corridorNodes.length > 0) {
      const nearestCorridorNode = findNearestNode(roomNode, corridorNodes);
      const distance = calculateDistance(roomNode.coordinates, nearestCorridorNode.coordinates);
      
      edges.push({
        source: roomNode.id,
        target: nearestCorridorNode.id,
        weight: distance
      });
      
      edges.push({
        source: nearestCorridorNode.id,
        target: roomNode.id,
        weight: distance
      });
    }
  });

  // Connect transport nodes to nearest corridor
  transportNodes.forEach(transportNode => {
    if (corridorNodes.length > 0) {
      const nearestCorridorNode = findNearestNode(transportNode, corridorNodes);
      const distance = calculateDistance(transportNode.coordinates, nearestCorridorNode.coordinates);
      
      edges.push({
        source: transportNode.id,
        target: nearestCorridorNode.id,
        weight: distance
      });
      
      edges.push({
        source: nearestCorridorNode.id,
        target: transportNode.id,
        weight: distance
      });
    }
  });

  // Connect corridor nodes to each other if they're close enough
  const CORRIDOR_CONNECTION_THRESHOLD = 0.0003; // Adjust this value based on your coordinates scale
  
  for (let i = 0; i < corridorNodes.length; i++) {
    for (let j = i + 1; j < corridorNodes.length; j++) {
      const distance = calculateDistance(corridorNodes[i].coordinates, corridorNodes[j].coordinates);
      
      if (distance < CORRIDOR_CONNECTION_THRESHOLD) {
        edges.push({
          source: corridorNodes[i].id,
          target: corridorNodes[j].id,
          weight: distance
        });
        
        edges.push({
          source: corridorNodes[j].id,
          target: corridorNodes[i].id,
          weight: distance
        });
      }
    }
  }

  return { nodes, edges };
};

// Helper function to find the nearest node from a list
const findNearestNode = (targetNode: GraphNode, nodesList: GraphNode[]): GraphNode => {
  let nearestNode = nodesList[0];
  let minDistance = calculateDistance(targetNode.coordinates, nearestNode.coordinates);
  
  for (let i = 1; i < nodesList.length; i++) {
    const distance = calculateDistance(targetNode.coordinates, nodesList[i].coordinates);
    if (distance < minDistance) {
      minDistance = distance;
      nearestNode = nodesList[i];
    }
  }
  
  return nearestNode;
};

// Calculate Euclidean distance between two points
const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
  const dx = point1[0] - point2[0];
  const dy = point1[1] - point2[1];
  return Math.sqrt(dx * dx + dy * dy);
};

// Connect vertical transportation across floors
const connectFloorsInBuilding = (buildingId: string, graph: { nodes: GraphNode[], edges: GraphEdge[] }): { nodes: GraphNode[], edges: GraphEdge[] } => {
  const verticalTransportNodes = graph.nodes.filter(node => 
    ['stairs', 'elevator', 'escalator'].includes(node.type)
  );
  
  // Group by type and approximate position
  const groupedByTypeAndPosition: { [key: string]: GraphNode[] } = {};
  
  verticalTransportNodes.forEach(node => {
    // Round coordinates to group nearby vertical transport on different floors
    const roundedX = Math.round(node.coordinates[0] * 10000) / 10000;
    const roundedY = Math.round(node.coordinates[1] * 10000) / 10000;
    const key = `${node.type}-${roundedX}-${roundedY}`;
    
    if (!groupedByTypeAndPosition[key]) {
      groupedByTypeAndPosition[key] = [];
    }
    
    groupedByTypeAndPosition[key].push(node);
  });
  
  // Connect nodes in the same group
  Object.values(groupedByTypeAndPosition).forEach(group => {
    if (group.length > 1) {
      // Connect each node to every other node in the group
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          // Assign different weights based on type
          let weight = 1.0; // Default for stairs
          
          if (group[i].type === 'elevator') {
            weight = 0.5; // Elevators are faster
          } else if (group[i].type === 'escalator') {
            weight = 0.8; // Escalators are in between
          }
          
          graph.edges.push({
            source: group[i].id,
            target: group[j].id,
            weight: weight
          });
          
          graph.edges.push({
            source: group[j].id,
            target: group[i].id,
            weight: weight
          });
        }
      }
    }
  });
  
  return graph;
};

// Connect buildings via entrance nodes
const connectBuildings = (graph: { nodes: GraphNode[], edges: GraphEdge[] }): { nodes: GraphNode[], edges: GraphEdge[] } => {
  const entranceNodes = graph.nodes.filter(node => node.type === 'entrance');
  const buildingEntrances: { [key: string]: GraphNode[] } = {};
  
  // Group entrances by building
  entranceNodes.forEach(node => {
    if (!buildingEntrances[node.building]) {
      buildingEntrances[node.building] = [];
    }
    buildingEntrances[node.building].push(node);
  });
  
  // Connect entrances of different buildings if they're close enough
  const BUILDING_CONNECTION_THRESHOLD = 0.001; // Adjust based on your coordinates scale
  
  const buildingIds = Object.keys(buildingEntrances);
  
  for (let i = 0; i < buildingIds.length; i++) {
    for (let j = i + 1; j < buildingIds.length; j++) {
      const buildingA = buildingIds[i];
      const buildingB = buildingIds[j];
      
      // Find closest entrance pair between two buildings
      let minDistance = Infinity;
      let closestEntranceA: GraphNode | null = null;
      let closestEntranceB: GraphNode | null = null;
      
      buildingEntrances[buildingA].forEach(entranceA => {
        buildingEntrances[buildingB].forEach(entranceB => {
          const distance = calculateDistance(entranceA.coordinates, entranceB.coordinates);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestEntranceA = entranceA;
            closestEntranceB = entranceB;
          }
        });
      });
      
      // Connect the closest entrances if they're within threshold
      if (closestEntranceA && closestEntranceB && minDistance < BUILDING_CONNECTION_THRESHOLD) {
        graph.edges.push({
          source: closestEntranceA.id,
          target: closestEntranceB.id,
          weight: minDistance
        });
        
        graph.edges.push({
          source: closestEntranceB.id,
          target: closestEntranceA.id,
          weight: minDistance
        });
      }
    }
  }
  
  return graph;
};

// Build a complete indoor navigation graph
export const buildNavigationGraph = (): { nodes: GraphNode[], edges: GraphEdge[] } => {
  let allNodes: GraphNode[] = [];
  let allEdges: GraphEdge[] = [];
  
  // Process each building and floor
  const processedBuildings = new Set<string>();
  
  buildingFloorAssociations.forEach(association => {
    const { buildingID, floor, component } = association;
    
    // Create graph for each floor
    const floorGraph = createFloorGraph(buildingID, floor, component);
    
    allNodes = [...allNodes, ...floorGraph.nodes];
    allEdges = [...allEdges, ...floorGraph.edges];
    
    processedBuildings.add(buildingID);
  });
  
  // Connect floors within buildings
  const buildingsArray = Array.from(processedBuildings);
  buildingsArray.forEach(buildingId => {
    const buildingGraph = {
      nodes: allNodes.filter(node => node.building === buildingId),
      edges: allEdges.filter(edge => {
        const sourceNode = allNodes.find(node => node.id === edge.source);
        return sourceNode && sourceNode.building === buildingId;
      })
    };
    
    const connectedBuildingGraph = connectFloorsInBuilding(buildingId, buildingGraph);
    
    // Update main graph with new connections
    allEdges = [
      ...allEdges.filter(edge => {
        const sourceNode = allNodes.find(node => node.id === edge.source);
        return !sourceNode || sourceNode.building !== buildingId;
      }),
      ...connectedBuildingGraph.edges
    ];
  });
  
  // Connect different buildings
  const completeGraph = connectBuildings({ nodes: allNodes, edges: allEdges });
  
  return completeGraph;
};

// Find path between two rooms
export const findPathBetweenRooms = (
  originRoom: RoomInfo | null,
  destinationRoom: RoomInfo | null
): Feature<LineString>[] => {
  if (!originRoom || !destinationRoom || !originRoom.coordinates || !destinationRoom.coordinates) {
    return [];
  }
  
  // Build the navigation graph
  const graph = buildNavigationGraph();
  
  // Find the nodes corresponding to origin and destination rooms
  const originBuildingFloor = buildingFloorAssociations.find(
    association => association.component === originRoom.component
  );
  
  const destBuildingFloor = buildingFloorAssociations.find(
    association => association.component === destinationRoom.component
  );
  
  if (!originBuildingFloor || !destBuildingFloor) {
    return [];
  }
  
  // Find the room nodes
  const originNodeId = `${originBuildingFloor.buildingID}-${originRoom.floor}-room-${originRoom.ref}`;
  const destNodeId = `${destBuildingFloor.buildingID}-${destinationRoom.floor}-room-${destinationRoom.ref}`;
  
  const originNode = graph.nodes.find(node => node.id === originNodeId);
  const destNode = graph.nodes.find(node => node.id === destNodeId);
  
  // If exact nodes not found, find nearest nodes
  let startNodeId = originNodeId;
  let endNodeId = destNodeId;
  
  if (!originNode) {
    // Find nearest node to origin coordinates
    const nearestOriginNode = findNearestNodeByCoordinates(
      graph.nodes, 
      originRoom.coordinates as [number, number], 
      originBuildingFloor.buildingID,
      originRoom.floor
    );
    if (nearestOriginNode) {
      startNodeId = nearestOriginNode.id;
    }
  }
  
  if (!destNode) {
    // Find nearest node to destination coordinates
    const nearestDestNode = findNearestNodeByCoordinates(
      graph.nodes, 
      destinationRoom.coordinates as [number, number],
      destBuildingFloor.buildingID,
      destinationRoom.floor
    );
    if (nearestDestNode) {
      endNodeId = nearestDestNode.id;
    }
  }
  
  // Create adjacency list for Dijkstra's algorithm
  const adjacencyList: { [key: string]: { node: string, weight: number }[] } = {};
  
  graph.nodes.forEach(node => {
    adjacencyList[node.id] = [];
  });
  
  graph.edges.forEach(edge => {
    adjacencyList[edge.source].push({ node: edge.target, weight: edge.weight });
  });
  
  // Run Dijkstra's algorithm
  const { distances, predecessors } = dijkstra(adjacencyList, startNodeId);
  
  // Extract path
  const pathNodeIds = extractPath(predecessors, startNodeId, endNodeId);
  
  if (pathNodeIds.length === 0) {
    // No path found
    return [];
  }
  
  // Convert path nodes to features
  const pathFeatures: Feature<LineString>[] = [];
  
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const currentNodeId = pathNodeIds[i];
    const nextNodeId = pathNodeIds[i + 1];
    
    const currentNode = graph.nodes.find(node => node.id === currentNodeId);
    const nextNode = graph.nodes.find(node => node.id === nextNodeId);
    
    if (currentNode && nextNode) {
      // Check if this is a floor transition
      const isFloorTransition = currentNode.floor !== nextNode.floor;
      
      // Create line segment
      const segment = lineString(
        [currentNode.coordinates, nextNode.coordinates],
        {
          isFloorTransition,
          sourceFloor: currentNode.floor,
          targetFloor: nextNode.floor,
          sourceBuilding: currentNode.building,
          targetBuilding: nextNode.building,
          sourceType: currentNode.type,
          targetType: nextNode.type
        }
      );
      
      pathFeatures.push(segment);
    }
  }
  
  return pathFeatures;
};

// Helper function to find nearest node by coordinates
const findNearestNodeByCoordinates = (
  nodes: GraphNode[], 
  coordinates: [number, number],
  buildingId: string,
  floor: string
): GraphNode | null => {
  // First try to find nodes on the same floor and building
  const sameFloorNodes = nodes.filter(
    node => node.building === buildingId && node.floor === floor
  );
  
  if (sameFloorNodes.length > 0) {
    return findNearestNode(
      { id: '', coordinates, type: '', floor, building: buildingId },
      sameFloorNodes
    );
  }
  
  // If no nodes on the same floor, try the same building
  const sameBuildingNodes = nodes.filter(node => node.building === buildingId);
  
  if (sameBuildingNodes.length > 0) {
    return findNearestNode(
      { id: '', coordinates, type: '', floor, building: buildingId },
      sameBuildingNodes
    );
  }
  
  // If all else fails, find the nearest node from all nodes
  if (nodes.length > 0) {
    return findNearestNode(
      { id: '', coordinates, type: '', floor, building: buildingId },
      nodes
    );
  }
  
  return null;
};

// Get features for a path on a specific floor
export const getPathFeaturesForFloor = (
  path: Feature<LineString>[],
  floorName: string
): Feature<LineString>[] => {
  return path.filter(segment => {
    const properties = segment.properties;
    return (
      (properties?.sourceFloor === floorName.charAt(0) || properties?.targetFloor === floorName.charAt(0)) &&
      !properties?.isFloorTransition
    );
  });
};