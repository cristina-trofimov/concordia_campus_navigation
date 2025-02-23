import React, { ReactNode, useEffect, useRef } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  PanResponder,
  Animated,
  PanResponderGestureState,
} from "react-native";
import SearchBar from "./SearchBar";

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

  return (
    <Animated.View style={[styles.container, { height: drawerHeight }]}>
      <View {...panResponder.panHandlers} style={styles.dragHandle}>
        <View style={styles.dragIndicator} />
        <SearchBar />
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
});

export default BottomDrawer;