import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { PoiFormStyles } from "../styles/Point-of-interest_Form-STYLES.tsx";
import analytics from '@react-native-firebase/analytics';
import { Ionicons } from "@expo/vector-icons";
import Modal from 'react-native-modal';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';



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
    if ((globalThis as any).isTesting && (globalThis as any).taskTimer.isStarted()) {
      if (newPOI === "Food and Drinks") {
        analytics().logEvent('good_POI', {
          POI: newPOI,
          user_id: (globalThis as any).userId,
        });
        console.log(`Custom Event Logged: good POI chosen: ${newPOI} was pressed`);
      } else {
        analytics().logEvent('wrong_POI', {
          POI: newPOI,
          user_id: (globalThis as any).userId,
        });
        console.log(`Custom Event Logged: bad POI chosen: ${newPOI} was pressed`);
      }
    }

    setSelectedPOI(newPOI);
  };

  const handleRadiusChange = (value: number) => {
    if ((globalThis as any).isTesting && (globalThis as any).taskTimer.isStarted()) {
      if (value === 150) {
        analytics().logEvent('good_radius', {
          POI: value,
          user_id: (globalThis as any).userId,
        });
        console.log(`Custom Event Logged: good radius chosen: ${value} meters was pressed`);
      } else {
        analytics().logEvent('wrong_radius', {
          POI: value,
          user_id: (globalThis as any).userId,
        });
        console.log(`Custom Event Logged: bad radius chosen: ${value} meters was pressed`);
      }
    }
    setSelectedRadius(value);
  };


  const [isVisible, setIsVisible] = useState(false);

  return (

    <View style={PoiFormStyles.containerAnother} >
      <View style={{ flex: 1, alignItems: 'flex-end' }}>


        <TouchableOpacity style={PoiFormStyles.button} onPress={() => { setIsVisible(!isVisible); }} >
          <FontAwesome6 name="map-location-dot" size={24} color="white" />
        </TouchableOpacity>

        <Modal isVisible={isVisible} onBackdropPress={() => setIsVisible(!isVisible)} onBackButtonPress={() => setIsVisible(!isVisible)}>
          <View style={PoiFormStyles.modalContent}>
            <View style={PoiFormStyles.container}>
              <Text style={PoiFormStyles.title}>Points of Interest</Text>

              {/* POI Picker */}
              <Picker
                testID="poi-picker"
                selectedValue={selectedPOI ?? "none"}
                onValueChange={(itemValue) => handlePOIChange(itemValue)}
                style={PoiFormStyles.picker}
                mode="dropdown"
              >
                <Picker.Item label="None" value="none" />
                {Object.keys(POI_MAPPING).map((poi) => (
                  <Picker.Item key={poi} label={poi} value={poi} />
                ))}
              </Picker>

              {/* Radius Picker */}
              <Text style={PoiFormStyles.title}>Search Radius</Text>
              <Picker
                testID="radius-picker"
                selectedValue={selectedRadius ?? 50}
                onValueChange={(value) => handleRadiusChange(value)}
                style={PoiFormStyles.picker}
                mode="dropdown"
              >
                {[25, 50, 75, 100, 150].map((r) => (
                  <Picker.Item key={r} label={`${r} meters`} value={r} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      </View>
    </View>

  );
};


export default PointOfInterestSelector;
