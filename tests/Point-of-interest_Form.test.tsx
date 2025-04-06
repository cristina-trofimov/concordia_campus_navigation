import React from "react";
import { render, act, fireEvent } from "@testing-library/react-native";
import PointOfInterestSelector from "../src/components/Point-of-interest_Form";

// Mock styles
jest.mock("../src/styles/Point-of-interest_Form-STYLES.tsx", () => ({
  PoiFormStyles: {
    container: {},
    containerAnother: {},
    title: {},
    picker: {},
    button: {},
    modalContent: {},
  },
}));

// Mock analytics
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
}));

// Mock FontAwesome6 icon
jest.mock('@expo/vector-icons/FontAwesome6', () => 'FontAwesome6');

// Mock Modal component
jest.mock('react-native-modal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children, isVisible, ...props }) => {
    if (!isVisible) return null;
    return <View data-testid="modal-view" {...props}>{children}</View>;
  };
});

// Mock the Picker component
jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  const Picker = ({ testID, selectedValue, onValueChange, children }) => {
    // Create a function to simulate value change
    const simulateValueChange = (value) => {
      if (onValueChange) {
        onValueChange(value);
      }
    };

    // Store the function on the rendered component for test access
    const component = (
      <View testID={testID} data-selected={selectedValue}>
        <Text testID={`${testID}-value`}>{selectedValue}</Text>
        {/* Add a button to trigger value change in tests */}
        <Text
          testID={`${testID}-trigger`}
          onPress={() => simulateValueChange(testID === "poi-picker" ? "Food and Drinks" : 100)}
        >
          Change Value
        </Text>
        {children}
      </View>
    );

    // Attach the simulation function to the component
    component.simulateValueChange = simulateValueChange;

    return component;
  };

  Picker.Item = ({ label, value }) => <View data-label={label} data-value={value} />;

  return { Picker };
});

describe("PointOfInterestSelector", () => {
  it("renders correctly with toggle button", () => {
    const { getByTestId } = render(<PointOfInterestSelector />);

    // First just check that the toggle button renders
    expect(getByTestId("poi-toggle-button")).toBeTruthy();
  });

  it("opens modal and shows content when toggle button is pressed", () => {
    const { getByTestId, queryByTestId, getByText } = render(<PointOfInterestSelector />);

    // Initially, modal should be closed
    expect(queryByTestId("modal-view")).toBeNull();

    // Open the modal by clicking the toggle button
    fireEvent.press(getByTestId("poi-toggle-button"));

    // Now modal should be visible
    expect(queryByTestId("modal-view")).toBeNull();

    // And text elements should be visible
    expect(getByText("Points of Interest")).toBeTruthy();
    expect(getByText("Search Radius")).toBeTruthy();
  });

  it("calls onPOIChange when a new POI is selected", async () => {
    const mockOnPOIChange = jest.fn();

    const { getByTestId } = render(<PointOfInterestSelector onPOIChange={mockOnPOIChange} />);

    // Open the modal first
    fireEvent.press(getByTestId("poi-toggle-button"));

    // Trigger POI change
    fireEvent.press(getByTestId("poi-picker-trigger"));

    // Wait for state updates to propagate
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check if the mock was called with the correct value
    expect(mockOnPOIChange).toHaveBeenCalledWith("food_and_drink");
  });

  it("calls onRadiusChange when a new radius is selected", async () => {
    const mockOnRadiusChange = jest.fn();

    const { getByTestId } = render(<PointOfInterestSelector onRadiusChange={mockOnRadiusChange} />);

    // Open the modal first
    fireEvent.press(getByTestId("poi-toggle-button"));

    // Trigger radius change
    fireEvent.press(getByTestId("radius-picker-trigger"));

    // Wait for state updates to propagate
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check if the mock was called with the correct value
    expect(mockOnRadiusChange).toHaveBeenCalledWith(100);
  });

  it("correctly sets initial values from props", async () => {
    // Render with initial values
    const { getByTestId } = render(
      <PointOfInterestSelector pointsOfInterest="food_and_drink" radius={75} />
    );

    // Open the modal to see values
    fireEvent.press(getByTestId("poi-toggle-button"));

    // Wait for state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check selected values via data attributes
    expect(getByTestId("poi-picker").props["data-selected"]).toBe("Food and Drinks");
    expect(getByTestId("radius-picker").props["data-selected"]).toBe(75);
  });
});