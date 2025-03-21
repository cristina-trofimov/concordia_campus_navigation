import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  View,
  PanResponder,
  Animated,
  PanResponderGestureState,
} from "react-native";
import { BottomDrawerStyle } from "../styles/BottomDrawerStyle";

const { height, width } = Dimensions.get("window");
const COLLAPSED_HEIGHT = height * 0.1;
const EXPANDED_HEIGHT = height * 0.5;
const FULL_EXPANDED_HEIGHT = height * 0.85;
const VELOCITY_THRESHOLD = 0.5;

function BottomDrawer({
  children,
  drawerHeight,
}: {
  children: Readonly<ReactNode>;
  drawerHeight: Readonly<Animated.Value>;
}) {
  const currentHeightRef = useRef<number>(EXPANDED_HEIGHT);


  const drawerState = useRef<number>(1);

  useEffect(() => {
    const id = drawerHeight.addListener(({ value }) => {
      currentHeightRef.current = value;
    });

    return () => drawerHeight.removeListener(id);
  }, [drawerHeight]);

  const animateToPosition = (state: number) => {
    drawerState.current = state;
    let targetHeight;

    switch (state) {
      case 0:
        targetHeight = COLLAPSED_HEIGHT;
        break;
      case 1:
        targetHeight = EXPANDED_HEIGHT;
        break;
      case 2:
        targetHeight = FULL_EXPANDED_HEIGHT;
        break;
      default:
        targetHeight = EXPANDED_HEIGHT;
    }

    Animated.spring(drawerHeight, {
      toValue: targetHeight,
      tension: 40,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handlePanResponderMove = (
    _: any,
    gesture: PanResponderGestureState
  ) => {
    let baseHeight;

    switch (drawerState.current) {
      case 0:
        baseHeight = COLLAPSED_HEIGHT;
        break;
      case 1:
        baseHeight = EXPANDED_HEIGHT;
        break;
      case 2:
        baseHeight = FULL_EXPANDED_HEIGHT;
        break;
      default:
        baseHeight = EXPANDED_HEIGHT;
    }

    const newHeight = Math.max(
      COLLAPSED_HEIGHT,
      Math.min(FULL_EXPANDED_HEIGHT, baseHeight - gesture.dy)
    );

    drawerHeight.setValue(newHeight);
  };

  const handlePanResponderRelease = (
    _: any,
    gesture: PanResponderGestureState
  ) => {
    const currentHeight = currentHeightRef.current;
    const midPoint1 = (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;
    const midPoint2 = (EXPANDED_HEIGHT + FULL_EXPANDED_HEIGHT) / 2;

    if (gesture.vy < -VELOCITY_THRESHOLD) {
      if (drawerState.current === 0) animateToPosition(1);
      else if (drawerState.current === 1) animateToPosition(2);
      else animateToPosition(2);
    } else if (gesture.vy > VELOCITY_THRESHOLD) {
      if (drawerState.current === 2) animateToPosition(1);
      else if (drawerState.current === 1) animateToPosition(0);
      else animateToPosition(0);
    } else {
      if (currentHeight < midPoint1) {
        animateToPosition(0);
      } else if (currentHeight < midPoint2) {
        animateToPosition(1);
      } else {
        animateToPosition(2);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
    })
  ).current;

  return (
    <Animated.View
      style={[BottomDrawerStyle.container, { height: drawerHeight }]}
    >
      <View {...panResponder.panHandlers} style={BottomDrawerStyle.dragHandle}>
        <View style={BottomDrawerStyle.dragIndicator} />
      </View>
      <View style={BottomDrawerStyle.contentContainer}>{children}</View>
    </Animated.View>
  );
}

export default BottomDrawer;
