import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useIndoor } from "../data/IndoorContext";
import { useCoords } from "../data/CoordsContext";
import { FloorSelectorStyle } from "../styles/FloorSelectorStyle";
import { useIndoorFeatures } from "../components/IndoorMap";
import AntDesign from '@expo/vector-icons/AntDesign';

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
    const { currentFloor, inFloorView, floorList, setInFloorView } = useIndoor();
    const { destinationCoords } = useCoords();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const { handleSelectFloor } = useFloorSelection();

    return (
        <>
            {inFloorView && (
                <View style={FloorSelectorStyle.container}>
                    {/* Back Button */}
                    {!destinationCoords && (
                        <TouchableOpacity
                            style={FloorSelectorStyle.backButton}
                            onPress={() => {
                                setInFloorView(false);
                            }}
                            testID="back-button-container"
                        >
                            <AntDesign name="arrowleft" size={24} color="black" testID="back-button" />
                        </TouchableOpacity>
                    )}

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
                                    style={[
                                        FloorSelectorStyle.option,
                                        index === floorList.length - 1 && { borderBottomWidth: 0 }
                                    ]}
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