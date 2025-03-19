import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  View,
  PanResponder,
  Animated,
  PanResponderGestureState,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import SearchBars from "./SearchBars";
import { useCoords } from "../data/CoordsContext";
import { BottomDrawerStyle } from "../styles/BottomDrawerStyle";
import { SearchBar } from "react-native-elements";

const { height, width } = Dimensions.get("window");
const COLLAPSED_HEIGHT = height * 0.1;
const EXPANDED_HEIGHT = height * 0.5;
const FULL_EXPANDED_HEIGHT = height * 0.85;
const VELOCITY_THRESHOLD = 0.5;

function BottomDrawer({
  children,
  drawerHeight,
}: {
  children: ReactNode;
  drawerHeight: Animated.Value;
}) {
  const { routeData: routeCoordinates, isTransit, setIsTransit } = useCoords();
  const [htmlInstructions, setHtmlInstructions] = useState<string[]>([]);
  const currentHeightRef = useRef<number>(EXPANDED_HEIGHT);

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const instructions = routeCoordinates[0].legs[0].steps.map(
        (step: any) => {
          return step.html_instructions
            .replace(/<[^>]*>/g, "")
            .replace(/(?=Destination)/gi, ". ");
        }
      );

      let detailedInstructions: string[] = [];
      const number = routeCoordinates[0].legs[0].steps.length;
      const instructionsGeneral = routeCoordinates[0].legs[0].steps.map(
        (step: any) => {
          return step.html_instructions.replace(/<[^>]*>/g, "");
        }
      );
      for (let i = 0; i < number; i++) {
        const detailedHtmlInstructions = routeCoordinates[0]?.legs[0]?.steps[
          i
        ]?.steps?.map((step: any) => {
          return step.html_instructions
            .replace(/<[^>]*>/g, "")
            .replace(/(?=Destination)/gi, ". ");
        });
        if (detailedHtmlInstructions == undefined) {
          detailedInstructions = detailedInstructions.concat(
            instructionsGeneral[i]
          );
        } else {
          detailedInstructions = detailedInstructions.concat(
            instructionsGeneral[i]
          );
          detailedInstructions = detailedInstructions.concat(
            detailedHtmlInstructions
          );
        }
      }
      if (isTransit == true) {
        setHtmlInstructions(detailedInstructions);
      } else {
        setHtmlInstructions(instructions);
      }
      console.log(htmlInstructions);
    } else {
      setHtmlInstructions([]);
    }
  }, [routeCoordinates]);

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
      <SearchBars />
      <View style={BottomDrawerStyle.listContent}>
        <ScrollView>
          {htmlInstructions.length > 0 &&
            htmlInstructions.map((instruction, index) => (
              <Text key={index} style={BottomDrawerStyle.instructionsList}>
                {instruction}
              </Text>
            ))}
        </ScrollView>
      </View>
      {/* <View style={BottomDrawerStyle.contentContainer}>{children}</View> */}
    </Animated.View>
  );
}

export default BottomDrawer;
