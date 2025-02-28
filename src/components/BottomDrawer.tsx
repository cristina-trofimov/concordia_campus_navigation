import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  PanResponder,
  Animated,
  PanResponderGestureState,
  Text,
  TouchableOpacity
} from "react-native";
import SearchBars from "./SearchBars";
import { useCoords } from "../data/CoordsContext";
import { Ionicons } from "@expo/vector-icons";


const { height, width } = Dimensions.get("window");
const COLLAPSED_HEIGHT = height * 0.1;
const EXPANDED_HEIGHT = height * 0.5;
const VELOCITY_THRESHOLD = 0.5;

function BottomDrawer({
  children,
  drawerHeight,
}: {
  children: ReactNode;
  drawerHeight: Animated.Value;
}) {

  const { routeData: routeCoordinates } = useCoords();
  const [htmlInstructions, setHtmlInstructions] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState("walk"); // Default to walking

  useEffect(() => {
    console.log("routeCoordinates changed:", routeCoordinates);

    if (routeCoordinates && routeCoordinates.length > 0) {
      const instructions = routeCoordinates[0].legs[0].steps.map((step: any) => {return step.html_instructions.replace(/<.*?>/g, '');});
      const HtmlContent = ({ instructions }: { instructions: string }) => {return (<div dangerouslySetInnerHTML={{ __html: instructions }} />);};
      //console.log("instructions:",instructions)
      setHtmlInstructions(instructions);
      //console.log("HTML changed:", htmlInstructions);
    } else {
      setHtmlInstructions([]);
    }

  }, [routeCoordinates]);

  const isExpanded = useRef<boolean>(true);

  const animateToPosition = (expanded: boolean) => {
    isExpanded.current = expanded;
    const targetHeight = expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
    Animated.spring(drawerHeight, {
      toValue: targetHeight,
      tension: 40,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handlePanResponderMove = (_: any, gesture: PanResponderGestureState) => {
    const newHeight = Math.max(
      COLLAPSED_HEIGHT,
      Math.min(
        EXPANDED_HEIGHT,
        isExpanded.current
          ? EXPANDED_HEIGHT - gesture.dy
          : COLLAPSED_HEIGHT - gesture.dy
      )
    );
    drawerHeight.setValue(newHeight);
  };

  const handlePanResponderRelease = (_: any, gesture: PanResponderGestureState) => {
    const shouldExpand = gesture.vy < 0 || (isExpanded.current && gesture.dy < 0);
    animateToPosition(shouldExpand);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
    })
  ).current;

  const transportModes = [
    { mode: "car", icon: "car-outline", label: "Driving", time: "12 min" },
    { mode: "bus", icon: "bus-outline", label: "Transit", time: "20 min" },
    { mode: "walk", icon: "walk-outline", label: "Walking", time: "35 min" },
    { mode: "bike", icon: "bicycle-outline", label: "Cycling", time: "18 min" },
  ];

  return (
    <Animated.View style={[styles.container, { height: drawerHeight }]}>
      <View {...panResponder.panHandlers} style={styles.dragHandle}>
        <View style={styles.dragIndicator} />
        <SearchBars />
        {htmlInstructions.length > 0 && (
          <>
            {/* Selected Transport Mode Title */}
            <View style={styles.selectedModeContainer}>
              <Text style={styles.selectedModeText}>
                {transportModes.find((t) => t.mode === selectedMode)?.label}
              </Text>
            </View>
  
            {/* Transport Buttons with Time Estimates */}
            <View style={styles.transportButtonContainer}>
              {transportModes.map(({ mode, icon, time }) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.transportButton,
                  ]}
                  onPress={() => setSelectedMode(mode)}
                >
                  <View style={styles.transportButtonContent}>
                    <Ionicons
                      name={icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={selectedMode === mode ? "#912338" : "black"}
                    />
                    <Text style={[styles.timeText, { color: selectedMode === mode ? "#912338" : "black" }]}>{time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
  
            {/* Instructions */}
            {htmlInstructions.map((instruction, index) => (
              <View key={index} style={styles.instructionContainer}>
                <Text>{instruction}</Text>
              </View>
            ))}
          </>
        )}
      </View>
      <View style={styles.contentContainer}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: width,
    position: "absolute",
    bottom: 0,
  },
  dragHandle: {
    width: width,
    alignItems: "center",
    paddingVertical: 10,
  },
  dragIndicator: {
    width: 60,
    height: 5,
    backgroundColor: "#8F8F8F",
    borderRadius: 3,
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  transportButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  transportButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  instructionContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectedModeContainer: {
    width: "100%",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  selectedModeText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginVertical: 5,
  },
  transportButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, 
  },
  timeText: {
    fontSize: 12,
  },
});

export default BottomDrawer;
