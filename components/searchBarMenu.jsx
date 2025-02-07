import React, { useRef } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
} from "react-native";

const { height, width } = Dimensions.get("window");
const MINIMUM_HEIGHT = height * 0.1;
const MAXIMUM_HEIGHT = height * 0.5;
const SNAP_THRESHOLD = 75;

export default function SearchBarMenu() {
  const containerHeight = useRef(new Animated.Value(MAXIMUM_HEIGHT)).current;
  const startHeight = useRef(MAXIMUM_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startHeight.current = containerHeight._value;
      },
      onPanResponderMove: (_, gesture) => {
        const newHeight = Math.max(
          MINIMUM_HEIGHT,
          Math.min(MAXIMUM_HEIGHT, startHeight.current - gesture.dy)
        );
        containerHeight.setValue(newHeight);
      },
      onPanResponderRelease: (_, gesture) => {
        let snapTo = startHeight.current;

        if (Math.abs(gesture.dy) > SNAP_THRESHOLD) {
          snapTo = gesture.dy > 0 ? MINIMUM_HEIGHT : MAXIMUM_HEIGHT;
        }

        Animated.spring(containerHeight, {
          toValue: snapTo,
          speed: 20,
          bounciness: 5,
          useNativeDriver: false,
        }).start();
      },
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
      </View>

      <Text>Hello</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: width,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    width: "100%",
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
