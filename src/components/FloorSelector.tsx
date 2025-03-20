import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useCoords } from "../data/CoordsContext";
import { FloorSelectorStyle } from "../styles/FloorSelectorStyle";

export const FloorSelector = () => {
    const { currentFloor, setCurrentFloor, inFloorView } = useCoords();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    // Example list of floors
    const floors = ["1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];

    const handleSelectFloor = (floor: string) => {
        setCurrentFloor(floor);
        setIsDropdownVisible(false);
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
                            {floors.map((floor, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={FloorSelectorStyle.option}
                                    onPress={() => handleSelectFloor(floor)}
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