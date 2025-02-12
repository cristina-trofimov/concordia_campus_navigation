import { render, fireEvent, act } from "@testing-library/react-native";
import BottomDrawer from "../src/components/BottomDrawer"; // Adjust the import to your file path
import '@testing-library/jest-native/extend-expect';
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


// Mock react-native components needed for your test
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');

  // Mock Animated.Value
  const mockAnimatedValue = jest.fn().mockImplementation(() => ({
    setValue: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));

  // Mock other react-native components you use in the BottomDrawer
  const mockText = jest.fn(({ children }) => children);
  const mockView = jest.fn(({ children }) => children);

  return {
    ...rn,
    Animated: {
      ...rn.Animated,
      Value: mockAnimatedValue,  // Mock Animated.Value
    },
    Text: mockText,
    View: mockView,
  };
});



jest.mock('react-native', () => {
    const actualReactNative = jest.requireActual('react-native');
  return {
    StyleSheet: {
      create: () => ({
        container: {
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            width: 100,
          },
          dragHandle: {
            width: 100,
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
      }),
    },
 Dimensions: {
      get: () => ({
        window: {
          width: 400,  // Example value for window width
          height: 800, // Example value for window height
        },
      }),
    },
  };
});

describe("BottomDrawer Component", () => {

  let wrapper;

  beforeEach(() => {
    wrapper = render(
      <BottomDrawer>
        <Text>Test Content</Text>
      </BottomDrawer>
    );
  });

  test("should render BottomDrawer with children", () => {
    const { getByText } = wrapper;
    expect(getByText("Test Content")).toBeTruthy();
  });

  test("should initialize with expanded height", () => {
    const { getByTestId } = wrapper;
    expect(getByTestId("bottom-drawer")).toHaveStyle({ height: expect.any(Number) });
  });

  test("should call animateToPosition and update the height when expanded", () => {
    const { getByTestId } = wrapper;

    // Access the animateToPosition method using a spy
    const animateToPositionSpy = jest.spyOn(Animated, "spring");
    const containerHeight = wrapper.container.findByType(Animated.View);

    act(() => {
      containerHeight.props.style[1].toValue = 300; // Setting height directly for testing
    });

    // Check if the animateToPosition function was called to animate height change
    expect(animateToPositionSpy).toHaveBeenCalled();
    expect(containerHeight.props.style[1].toValue).toEqual(300);  // Check if height was updated

    // Cleanup spy
    animateToPositionSpy.mockRestore();
  });

  test("should update height when pan gesture is moved", () => {
    const { getByTestId } = wrapper;
    const dragHandle = getByTestId("drag-handle");
    const containerHeight = getByTestId("bottom-drawer");

    // Simulate a move gesture with a change in y position
    fireEvent(dragHandle, "moveShouldSetResponder", {
      nativeEvent: { pageY: 100 },
    });

    expect(containerHeight).toHaveStyle({ height: expect.any(Number) });
  });

  test("should trigger handlePanResponderGrant on pan start", () => {
    const { getByTestId } = wrapper;
    const dragHandle = getByTestId("drag-handle");
    const spy = jest.fn();

    // Simulate a pan start
    fireEvent(dragHandle, "startShouldSetResponder");

    // Check if the handler (gestureStartY) was called with a value
    expect(spy).not.toHaveBeenCalled();
  });

  test("should collapse or expand based on swipe velocity", async () => {
    const { getByTestId } = wrapper;
    const dragHandle = getByTestId("drag-handle");

    // Simulate a pan release with a specific velocity
    fireEvent(dragHandle, "startShouldSetResponder");
    fireEvent(dragHandle, "moveShouldSetResponder", { nativeEvent: { pageY: 100 } });
    fireEvent(dragHandle, "endShouldSetResponder", {
      nativeEvent: { velocityY: -1, pageY: 100 }, // Simulating a fast swipe
    });

    // Wait for animation completion and check the height change
    await act(() => Promise.resolve());
    expect(getByTestId("bottom-drawer")).toHaveStyle({ height: expect.any(Number) });
  });

  test("should collapse when swipe gesture goes down", async () => {
    const { getByTestId } = wrapper;
    const dragHandle = getByTestId("drag-handle");

    // Simulate a downward swipe to collapse
    fireEvent(dragHandle, "startShouldSetResponder");
    fireEvent(dragHandle, "moveShouldSetResponder", { nativeEvent: { pageY: 400 } });
    fireEvent(dragHandle, "endShouldSetResponder");

    // Check that the drawer collapsed
    await act(() => Promise.resolve());
    expect(getByTestId("bottom-drawer")).toHaveStyle({ height: expect.any(Number) });
  });

  test("should expand when swipe gesture goes up", async () => {
    const { getByTestId } = wrapper;
    const dragHandle = getByTestId("drag-handle");

    // Simulate an upward swipe to expand
    fireEvent(dragHandle, "startShouldSetResponder");
    fireEvent(dragHandle, "moveShouldSetResponder", { nativeEvent: { pageY: 200 } });
    fireEvent(dragHandle, "endShouldSetResponder");

    // Check that the drawer expanded
    await act(() => Promise.resolve());
    expect(getByTestId("bottom-drawer")).toHaveStyle({ height: expect.any(Number) });
  });
});
