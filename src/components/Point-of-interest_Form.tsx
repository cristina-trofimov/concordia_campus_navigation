import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

type PointOfInterestSelectorProps = {
  pointsOfInterest?: string | null;
  radius?: number | null;
  onPOIChange?: (poi: string | null) => void;
  onRadiusChange?: (radius: number | null) => void;
};

// Mapping between display labels and actual POI values
const POI_MAPPING: Record<string, string> = {
  "Food and Drinks": "food_and_drink",
  "Grocery": "food_and_drink_stores",
  "Public Facilities": "public_facilities",
  "Stores": "store_like",
  "Arts & Entertainment": "arts_and_entertainment",
};

// Reverse mapping for display purposes
const REVERSE_POI_MAPPING = Object.fromEntries(
  Object.entries(POI_MAPPING).map(([key, value]) => [value, key])
);

const PointOfInterestSelector: React.FC<PointOfInterestSelectorProps> = ({
  pointsOfInterest,
  radius,
  onPOIChange,
  onRadiusChange,
}) => {
  const [selectedPOI, setSelectedPOI] = useState<string | null>(
    pointsOfInterest ? REVERSE_POI_MAPPING[pointsOfInterest] || null : null
  );
  const [selectedRadius, setSelectedRadius] = useState<number | null>(radius ?? 50);

  useEffect(() => {
    setSelectedPOI(pointsOfInterest ? REVERSE_POI_MAPPING[pointsOfInterest] || null : null);
  }, [pointsOfInterest]);

  useEffect(() => {
    setSelectedRadius(radius ?? 50);
  }, [radius]);

  useEffect(() => {
    if (onPOIChange) {
      // Convert display label to actual POI value
      const poiValue = selectedPOI ? POI_MAPPING[selectedPOI] || null : null;
      onPOIChange(poiValue);
    }
  }, [selectedPOI, onPOIChange]);

  useEffect(() => {
    if (onRadiusChange) {
      onRadiusChange(selectedRadius);
    }
  }, [selectedRadius, onRadiusChange]);

  const handlePOIChange = (itemValue: string) => {
    const newPOI = itemValue === "none" ? null : itemValue;
    setSelectedPOI(newPOI);
  };

  const handleRadiusChange = (value: number) => {
    setSelectedRadius(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Points of Interest</Text>

      {/* POI Picker */}
      <Picker
        selectedValue={selectedPOI || "none"}
        onValueChange={(itemValue) => handlePOIChange(itemValue)}
        style={styles.picker}
        mode="dropdown"
      >
        <Picker.Item label="None" value="none" />
        {Object.keys(POI_MAPPING).map((poi) => (
          <Picker.Item key={poi} label={poi} value={poi} />
        ))}
      </Picker>

      {/* Radius Picker */}
      <Text style={styles.title}>Search Radius</Text>
      <Picker
        selectedValue={selectedRadius || 50}
        onValueChange={(value) => handleRadiusChange(value)}
        style={styles.picker}
        mode="dropdown"
      >
        {[25, 50, 75, 100, 150].map((r) => (
          <Picker.Item key={r} label={`${r} meters`} value={r} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 10,
  },
});

export default PointOfInterestSelector;
