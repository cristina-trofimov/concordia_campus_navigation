import React, { ReactNode, useRef } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
  PanResponderGestureState,
} from "react-native";

const { height, width } = Dimensions.get("window");
const COLLAPSED_HEIGHT = height * 0.1;
const EXPANDED_HEIGHT = height * 0.5;
const VELOCITY_THRESHOLD = 0.5; // swipe speed

function BottomDrawer ({children} : {children : ReactNode} ) {
  const containerHeight = useRef(new Animated.Value(EXPANDED_HEIGHT)).current;
  const isExpanded = useRef<boolean>(true);
  const gestureStartY = useRef<number>(0);

  const animateToPosition = (expanded: boolean) => {
    isExpanded.current = expanded;
    Animated.spring(containerHeight, {
      toValue: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
      tension: 40,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handlePanResponderMove = (
    _: any,
    gesture: PanResponderGestureState
  ) => {
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

  const handlePanResponderGrant = (
    _: any,
    gesture: PanResponderGestureState
  ) => {
    gestureStartY.current = gesture.y0;
  };

  const handlePanResponderRelease = (
    _: any,
    gesture: PanResponderGestureState
  ) => {
    const totalDistance = gesture.dy;
    const heightDifference = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;

    if (Math.abs(gesture.vy) > VELOCITY_THRESHOLD) {
      animateToPosition(gesture.vy < 0);
    } else {
      const shouldExpand = isExpanded.current
        ? Math.abs(totalDistance) < heightDifference / 2
        : -totalDistance > heightDifference / 2;

      animateToPosition(shouldExpand);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: handlePanResponderGrant,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: containerHeight,
        },
      ]}
    >
      <View {...panResponder.panHandlers} style={styles.dragHandle}>
        <View style={styles.dragIndicator} />
        { children }
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: width,
  },
  dragHandle: {
    width: width,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
  },
  dragIndicator: {
    width: 60,
    height: 5,
    backgroundColor: "#8F8F8F",
    borderRadius: 3,
  },
});

export default BottomDrawer;
