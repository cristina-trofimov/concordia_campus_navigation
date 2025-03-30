import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { DirectionStepsStyle } from "../styles/indoorRoutingStyle";
import { findPath, getPathCoordinates, cc1Graph, checkRoomConnections, checkGraphConnectivity, pathToGeoJSON } from "./RoutingAlog"; // Import from our new file

const IndoorDirectionsSteps = ({ startNodeId, endNodeId }) => {
  const [pathNodes, setPathNodes] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // When component mounts, perform basic graph checks
  useEffect(() => {
    console.log("Graph connectivity check:", checkGraphConnectivity());

    // Check a few sample rooms
    const sampleRooms = ["room_101", "room_120"];
    sampleRooms.forEach(roomId => {
      console.log(checkRoomConnections(roomId));
    });
  }, []);

  // When start or end node changes, find a path
  useEffect(() => {
    if (!startNodeId || !endNodeId) {
      return;
    }

    setLoading(true);
    setError(null);
    console.log(`Finding path from ${startNodeId} to ${endNodeId}`);

    // Validate input
    const startNodeExists = cc1Graph.nodes.has(startNodeId);
    const endNodeExists = cc1Graph.nodes.has(endNodeId);

    if (!startNodeExists || !endNodeExists) {
      setError(`Invalid nodes: Start node exists: ${startNodeExists}, End node exists: ${endNodeExists}`);
      setLoading(false);
      return;
    }

    try {
      // Find the path using the routing algorithm
      const path = findPath(startNodeId, endNodeId);
      console.log("Path result:", path);

      if (path && path.length > 0) {
        setPathNodes(path);

        // Generate instructions from the path
        const pathInstructions = generateInstructions(path);
        setInstructions(pathInstructions);
      } else {
        setPathNodes([]);
        setError("No path found between these locations");
        setInstructions(['No path found between these locations']);
      }
    } catch (err) {
      console.error("Error finding path:", err);
      setError(`Error: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [startNodeId, endNodeId]);

  // Function to generate human-readable instructions from node IDs
  const generateInstructions = (path: string[]): string[] => {
    const result: string[] = [];

    for (let i = 0; i < path.length; i++) {
      const currentNode = cc1Graph.nodes.get(path[i]);
      if (!currentNode) continue;

      // First node is starting point
      if (i === 0) {
        const roomRef = currentNode.properties.ref || currentNode.id.replace('room_', '');
        result.push(`Start at Room ${roomRef}`);
        continue;
      }

      // Last node is destination
      if (i === path.length - 1) {
        const roomRef = currentNode.properties.ref || currentNode.id.replace('room_', '');
        result.push(`Destination: Room ${roomRef}`);
        continue;
      }

      // Get previous and next nodes to determine direction
      const prevNode = cc1Graph.nodes.get(path[i-1]);
      const nextNode = cc1Graph.nodes.get(path[i+1]);
      if (!prevNode || !nextNode) continue;

      // Generate appropriate instruction based on node type
      switch(currentNode.type) {
        case 'corridor':
          // Calculate direction based on coordinates
          const direction = getDirection(prevNode.coordinates, nextNode.coordinates);
          result.push(`Walk ${direction} through the corridor`);
          break;
        case 'entrance':
          const nextRoomRef = nextNode.properties.ref || nextNode.id.replace('room_', '');
          result.push(`Go through the entrance to Room ${nextRoomRef}`);
          break;
        case 'elevator':
          const currentLevel = Number(currentNode.properties.level) || 1;
          const nextLevel = Number(nextNode.properties.level) || 1;
          result.push(`Take the elevator ${nextLevel > currentLevel ? 'up' : 'down'} to level ${nextLevel}`);
          break;
        case 'steps':
          const currLevel = Number(currentNode.properties.level) || 1;
          const nxtLevel = Number(nextNode.properties.level) || 1;
          result.push(`Take the stairs ${nxtLevel > currLevel ? 'up' : 'down'} to level ${nxtLevel}`);
          break;
        default:
          const roomRef = currentNode.properties.ref || currentNode.id.replace('room_', '');
          result.push(`Continue to Room ${roomRef}`);
      }
    }

    return result;
  };

  // Helper function to determine direction
  const getDirection = (from: [number, number], to: [number, number]): string => {
    const [x1, y1] = from;
    const [x2, y2] = to;

    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    if (angle >= -45 && angle < 45) return "east";
    if (angle >= 45 && angle < 135) return "north";
    if (angle >= 135 || angle < -135) return "west";
    return "south";
  };

  return (
    <View style={DirectionStepsStyle.container}>
      {loading && (
        <View style={DirectionStepsStyle.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={DirectionStepsStyle.loadingText}>Finding the best route...</Text>
        </View>
      )}

      {error && (
        <View style={DirectionStepsStyle.errorContainer}>
          <Text style={DirectionStepsStyle.errorText}>{error}</Text>
        </View>
      )}

      {instructions.length > 0 && !loading &&
        instructions.map((instruction, index) => {
          const iconMappings: { [key: string]: string } = {
            destination: "location-on",
            start: "trip-origin",
            entrance: "door-front",
            corridor: "straight",
            elevator: "elevator",
            stairs: "stairs",
            room: "meeting-room",
            continue: "straight",
            walk: "directions-walk",
            north: "arrow-upward",
            south: "arrow-downward",
            east: "arrow-forward",
            west: "arrow-back"
          };

          const lowerCaseInstruction = instruction.toLowerCase();

          const instructionsIconsDisplay = Object.keys(iconMappings).find(
            (key) => lowerCaseInstruction.includes(key)
          )
            ? iconMappings[
                Object.keys(iconMappings).find((key) =>
                  lowerCaseInstruction.includes(key)
                )!
              ]
            : "help-outline"; // Default icon

          return (
            <View key={index} style={DirectionStepsStyle.instructionsList}>
              <View>
                <View style={DirectionStepsStyle.iconsBox}>
                  {instructionsIconsDisplay && (
                    <MaterialIcons
                      name={
                        instructionsIconsDisplay as keyof typeof MaterialIcons.glyphMap
                      }
                      size={30}
                      color="black"
                    />
                  )}
                </View>
              </View>
              <View style={DirectionStepsStyle.topBorder}>
                <Text style={DirectionStepsStyle.instructionText}>
                  {instruction}
                </Text>
              </View>
            </View>
          );
        })}
    </View>
  );
};

export default IndoorDirectionsSteps;