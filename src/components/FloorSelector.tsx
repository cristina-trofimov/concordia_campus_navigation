import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useIndoor } from "../data/IndoorContext";
import { FloorSelectorStyle } from "../styles/FloorSelectorStyle";
import { useIndoorFeatures } from "../components/IndoorMap";

export const useFloorSelection = () => {
    const { setCurrentFloor, floorList } = useIndoor();
    const { selectIndoorFeatures } = useIndoorFeatures();
  
    const handleSelectFloor = (floor: string) => {
      setCurrentFloor(floor);
      
      const index = floorList.indexOf(floor);
      if (index !== -1) {
        selectIndoorFeatures(index);
      }
    };
  
    return { handleSelectFloor };
  };

export const FloorSelector = () => {
    const { currentFloor, setCurrentFloor, inFloorView, floorList } = useIndoor();
    const { selectIndoorFeatures } = useIndoorFeatures();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const { handleSelectFloor } = useFloorSelection();

    return (
        <>
            {inFloorView && (
                <View style={FloorSelectorStyle.container}>
                    {/* Dropdown Trigger */}
                    <TouchableOpacity
                        style={FloorSelectorStyle.dropdownTrigger}
                        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
                    >
                        <Text style={FloorSelectorStyle.selectedFloorText}>
                            {currentFloor}
                        </Text>
                        <Text style={FloorSelectorStyle.arrowIcon}>▼</Text>
                    </TouchableOpacity>
    
                    {/* Dropdown Options */}
                    {isDropdownVisible && (
                        <View style={FloorSelectorStyle.dropdownOptions}>
                            {floorList.map((floor, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={FloorSelectorStyle.option}
                                    onPress={() => {
                                        handleSelectFloor(floor);
                                        setIsDropdownVisible(false);
                                    }}
                                >
                                    <Text style={FloorSelectorStyle.optionText}>{floor}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </>
    );
};