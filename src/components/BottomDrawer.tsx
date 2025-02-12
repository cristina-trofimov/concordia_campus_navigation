import React, { ReactNode, useRef } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  PanResponder,
  Animated,
  PanResponderGestureState,
} from "react-native";
import SearchBar from "./SearchBar"; // Import your search component
//import SearchBarMapbox from "./SearchBarMapbox";

const { height, width } = Dimensions.get("window");
const COLLAPSED_HEIGHT = height * 0.15; // Adjusted for title + bar visibility
const EXPANDED_HEIGHT = height * 0.5;
const VELOCITY_THRESHOLD = 0.5;

function BottomDrawer({ children }: { children: ReactNode }) {
  const containerHeight = useRef(new Animated.Value(EXPANDED_HEIGHT)).current;
  const isExpanded = useRef<boolean>(true);

  const animateToPosition = (expanded: boolean) => {
    isExpanded.current = expanded;
    Animated.spring(containerHeight, {
      toValue: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
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
    containerHeight.setValue(newHeight);
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

  return (
    <Animated.View style={[styles.container, { height: containerHeight }]}>
      {/* Drag Handle + Search Component */}
      <View {...panResponder.panHandlers} style={styles.dragHandle}>
        <View style={styles.dragIndicator} />
        <SearchBar /> {/* Include SearchTry inside the draggable area */}
      </View>

      {/* Children components (only visible when expanded) */}
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
});

export default BottomDrawer;