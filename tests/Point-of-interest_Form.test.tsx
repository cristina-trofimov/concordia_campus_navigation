import React from "react";
import { render, act } from "@testing-library/react-native";
import PointOfInterestSelector from "../src/components/Point-of-interest_Form";

jest.mock("../src/styles/Point-of-interest_Form-STYLES.tsx", () => ({
  PoiFormStyles: {
    container: {},
    title: {},
    picker: {},
  },
}));

// Create a global store to hold callbacks
const mockCallbacks = {
  poiOnValueChange: null,
  radiusOnValueChange: null,
  poiSelectedValue: null,
  radiusSelectedValue: null,
};

// Improved mock for the React Native Picker component
jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { View } = require("react-native");

  const Picker = ({ testID, selectedValue, onValueChange, children, ...props }) => {
    // Store callbacks and values in our global store
    if (testID === "poi-picker") {
      mockCallbacks.poiOnValueChange = onValueChange;
      mockCallbacks.poiSelectedValue = selectedValue;
    } else if (testID === "radius-picker") {
      mockCallbacks.radiusOnValueChange = onValueChange;
      mockCallbacks.radiusSelectedValue = selectedValue;
    }

    return (
      <View testID={testID} {...props}>
        {children}
      </View>
    );
  };

  Picker.Item = props => React.createElement('Item', props);

  return {
    Picker,
  };
});

describe("PointOfInterestSelector", () => {
  it("renders correctly with default values", () => {
    const { getByText } = render(<PointOfInterestSelector />);

    expect(getByText("Points of Interest")).toBeTruthy();
    expect(getByText("Search Radius")).toBeTruthy();
  });

  it("calls onPOIChange when a new POI is selected", async () => {
    const mockOnPOIChange = jest.fn();

    // Render the component
    render(<PointOfInterestSelector onPOIChange={mockOnPOIChange} />);

    // Wrap state updates in act()
    await act(async () => {
      // Use the stored onValueChange function from our global store
      mockCallbacks.poiOnValueChange("Food and Drinks");
    });

    // Allow the effect to run
    await act(async () => {
      // Wait for the next tick to let all effects complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockOnPOIChange).toHaveBeenCalledWith("food_and_drink");
  });

  it("calls onRadiusChange when a new radius is selected", async () => {
    const mockOnRadiusChange = jest.fn();

    // Render the component
    render(<PointOfInterestSelector onRadiusChange={mockOnRadiusChange} />);

    // Wrap state updates in act()
    await act(async () => {
      // Use the stored onValueChange function from our global store
      mockCallbacks.radiusOnValueChange(100);
    });

    // Allow the effect to run
    await act(async () => {
      // Wait for the next tick to let all effects complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockOnRadiusChange).toHaveBeenCalledWith(100);
  });

  it("correctly sets initial values from props", () => {
    // Render the component with initial props
    render(<PointOfInterestSelector pointsOfInterest="food_and_drink" radius={75} />);

    // Check the stored selectedValue values from our global store
    expect(mockCallbacks.poiSelectedValue).toBe("Food and Drinks");
    expect(mockCallbacks.radiusSelectedValue).toBe(75);
  });
});