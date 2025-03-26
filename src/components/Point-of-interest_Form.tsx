import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

type PointOfInterestSelectorProps = {
  pointsOfInterest: { [key: string]: boolean };
  onChange: (key: string) => void;
};

const PointOfInterestSelector: React.FC<PointOfInterestSelectorProps> = ({
  pointsOfInterest,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Points of Interest</Text>

      <Picker
        selectedValue={Object.keys(pointsOfInterest).filter((poi) => pointsOfInterest[poi])}
        onValueChange={(itemValue, itemIndex) => {
          // If "None" is selected, reset the selection
          onChange(itemValue === "none" ? "" : itemValue);
        }}
        style={styles.picker}
        mode="dropdown"
      >
        {/* Option for "None" */}
        <Picker.Item label="None" value="none" />

        {/* List of POIs */}
        {["restaurant", "gasStation", "stores", "bank", "cafe"].map((poi) => (
          <Picker.Item key={poi} label={poi.charAt(0).toUpperCase() + poi.slice(1)} value={poi} />
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
  },
});

export default PointOfInterestSelector;

