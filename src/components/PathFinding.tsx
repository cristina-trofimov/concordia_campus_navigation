// Implementation of Dijkstra's algorithm for pathfinding

// Dijkstra's algorithm to find the shortest path
export const dijkstra = (
    graph: { [key: string]: { node: string, weight: number }[] },
    startNode: string
  ): { distances: { [key: string]: number }, predecessors: { [key: string]: string | null } } => {
    // Initialize distances with infinity for all nodes except the start node
    const distances: { [key: string]: number } = {};
    const predecessors: { [key: string]: string | null } = {};
    const visited: Set<string> = new Set();
    
    // Priority queue implementation (simple array for this case)
    const queue: { node: string, distance: number }[] = [];
    
    // Initialize
    for (const node in graph) {
      distances[node] = node === startNode ? 0 : Infinity;
      predecessors[node] = null;
    }
    
    queue.push({ node: startNode, distance: 0 });
    
    while (queue.length > 0) {
      // Sort the queue to get the node with the minimum distance
      queue.sort((a, b) => a.distance - b.distance);
      
      // Get the node with the minimum distance
      const { node: currentNode } = queue.shift()!;
      
      // Skip if already visited
      if (visited.has(currentNode)) {
        continue;
      }
      
      // Mark as visited
      visited.add(currentNode);
      
      // For each neighbor of the current node
      for (const { node: neighbor, weight } of graph[currentNode]) {
        // Skip visited neighbors
        if (visited.has(neighbor)) {
          continue;
        }
        
        // Calculate new distance
        const newDistance = distances[currentNode] + weight;
        
        // If new distance is less than current distance
        if (newDistance < distances[neighbor]) {
          // Update distance
          distances[neighbor] = newDistance;
          
          // Update predecessor
          predecessors[neighbor] = currentNode;
          
          // Add to queue
          queue.push({ node: neighbor, distance: newDistance });
        }
      }
    }
    
    return { distances, predecessors };
  };
  
  // Extract path from predecessors
  export const extractPath = (
    predecessors: { [key: string]: string | null },
    startNode: string,
    endNode: string
  ): string[] => {
    const path: string[] = [];
    let currentNode: string | null = endNode;
    
    // If end node is not reachable
    if (!predecessors[endNode] && endNode !== startNode) {
      return [];
    }
    
    // Reconstruct path
    while (currentNode) {
      path.unshift(currentNode);
      
      if (currentNode === startNode) {
        break;
      }
      
      currentNode = predecessors[currentNode];
    }
    
    return path;
  };