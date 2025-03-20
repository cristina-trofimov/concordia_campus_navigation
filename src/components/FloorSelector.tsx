import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useCoords } from "../data/CoordsContext";
import { FloorSelectorStyle } from "../styles/FloorSelectorStyle";
import { useIndoorFeatures } from "../components/IndoorMap";

export const FloorSelector = () => {
    const { currentFloor, setCurrentFloor, inFloorView, floorList } = useCoords();
    const { selectIndoorFeatures } = useIndoorFeatures();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const handleSelectFloor = (floor: string) => {
        setCurrentFloor(floor);
        setIsDropdownVisible(false);

        const index = floorList.indexOf(floor);

        if (index !== null) {
            selectIndoorFeatures(index);
        }
    };

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
                                    onPress={() => handleSelectFloor(floor) }
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