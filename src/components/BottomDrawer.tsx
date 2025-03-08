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
import { BottomDrawerStyle } from "../styles/BottomDrawerStyle";

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

  useEffect(() => {


    if (routeCoordinates && routeCoordinates.length > 0) {
      const instructions = routeCoordinates[0].legs[0].steps.map((step: any) => { return step.html_instructions.replace(/<.*?>/g, ''); });


      setHtmlInstructions(instructions);

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

  return (
    <Animated.View style={[BottomDrawerStyle.container, { height: drawerHeight }]}>
      <View {...panResponder.panHandlers} style={BottomDrawerStyle.dragHandle}>
        <View style={BottomDrawerStyle.dragIndicator} />
        <SearchBars />
        {htmlInstructions.length > 0 &&
          htmlInstructions.map((instruction, index) => (
            <Text key={index} >
              {instruction}
            </Text>
          ))}
      </View>
      <View style={BottomDrawerStyle.contentContainer}>{children}</View>
    </Animated.View>
  );
}



export default BottomDrawer;
