import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { point } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { SearchBarStyle } from "../styles/SearchBarStyle";
import { featureMap } from "../components/IndoorMap";
import { useIndoor } from "../data/IndoorContext";
import { buildingFloorAssociations } from "../data/buildingFloorAssociations";
import { fixedBuildingFeatures } from "./BuildingCoordinates";

interface RoomSearchBarProps {
    location: any;
    placeholder?: string;
    onSelect?: (room: string, floor: string) => void;
    defaultValue?: string | null;
    showClearButton?: boolean;
    onClear?: () => void;
}

interface RoomInfo {
    ref: string;
    floor: string;
    component: string;
}

export const RoomSearchBar: React.FC<RoomSearchBarProps> = ({
    location,
    placeholder,
    onSelect,
    defaultValue = null,
    showClearButton = false,
    onClear
}) => {
    const [query, setQuery] = useState("");
    const [buildingID, setBuildingID] = useState("");
    const [displayedRoom, setDisplayedRoom] = useState(defaultValue || "");
    const [suggestions, setSuggestions] = useState<RoomInfo[]>([]);
    const [allRooms, setAllRooms] = useState<RoomInfo[]>([]);
    const { setInFloorView, setCurrentFloor, setCurrentFloorAssociations, setIndoorFeatures } = useIndoor();
    const [buildingHasFloorPlans, setBuildingHasFloorPlans] = useState(false);

    const getBuildingIDFromCoords = (coords: { latitude: number, longitude: number }) => {
        if (!coords) return "";
    
        // Create a GeoJSON point from the coordinates
        const pt = point([coords.longitude, coords.latitude]);
    
        // Check each building feature to see if the point is inside
        for (const building of fixedBuildingFeatures) {
            // Make sure we have a valid polygon
            if (building.geometry && building.geometry.type === 'Polygon') {
                // Check if the point is inside this building's polygon
                if (booleanPointInPolygon(pt, building.geometry)) {
                    return building.properties.id;
                }
            }
        }
    
        return "";
    };

    // Extract all rooms from the building's floors when the building changes
    useEffect(() => {
        // Convert location to buildingID
        console.log("Location:", location);
        const id = getBuildingIDFromCoords(location);
        setBuildingID(id);

        if (buildingID.length > 0) {
            const buildingFloors = buildingFloorAssociations.filter(
                association => association.buildingID === buildingID
            );

            buildingFloors.length === 0 ? setBuildingHasFloorPlans(false) : setBuildingHasFloorPlans(true);
            console.log("Building ID:", buildingID);

            const roomsWithFloors: RoomInfo[] = [];

            buildingFloors.forEach(floorAssociation => {
                const component = floorAssociation.component;
                const floor = floorAssociation.floor;

                if (featureMap[component]) {
                    const floorFeatures = featureMap[component];

                    floorFeatures.forEach((feature: any) => {
                        if (
                            feature.properties.indoor === "room" &&
                            feature.properties.ref &&
                            feature.geometry.type === "Polygon"
                        ) {
                            roomsWithFloors.push({
                                ref: feature.properties.ref,
                                floor: floor,
                                component: component
                            });
                        }
                    });
                }
            });

            setAllRooms(roomsWithFloors);
        }
        else {
            setAllRooms([]);
            setBuildingHasFloorPlans(false);
            setQuery("");
            setDisplayedRoom("");
        }
    }, [location]);

    // Filter rooms based on search query
    const filterSuggestions = (text: string) => {
        if (!text || text.length < 1) {
            setSuggestions([]);
            return;
        }

        const filtered = allRooms.filter(room =>
            room.ref.toLowerCase().includes(text.toLowerCase())
        );

        setSuggestions(filtered);
    };

    // Handle search input changes
    const handleInputChange = (text: string) => {
        setQuery(text);
        setDisplayedRoom("");
        filterSuggestions(text);
    };

    // Handle selection of a room from suggestions
    const handleSuggestionPress = (room: RoomInfo) => {
        const displayText = `${room.ref}`;
        setDisplayedRoom(displayText);
        setQuery("");
        setSuggestions([]);

        // Find the floor association index
        const floorAssociations = buildingFloorAssociations.filter(
            association => association.buildingID === buildingID
        );

        const floorIndex = floorAssociations.findIndex(
            association => association.floor === room.floor
        );

        if (floorIndex !== -1) {
            // Set current floor associations
            setCurrentFloorAssociations(floorAssociations);

            // Set the selected floor's features
            const features = featureMap[room.component];
            if (features) {
                setIndoorFeatures(features);

                setCurrentFloor(room.floor);
                setInFloorView(true);
            }
        }

        // Call the onSelect callback if provided
        if (onSelect) {
            onSelect(room.ref, room.floor);
        }
    };

    // Handle clearing the search
    const handleClear = () => {
        setDisplayedRoom("");
        setQuery("");
        setSuggestions([]);
        if (onClear) {
            onClear();
        }
    };

    return (
        <>
            {buildingHasFloorPlans && (
                <View style={{ width: "40%" }}>
                    <View style={SearchBarStyle.inputContainer}>
                        <MaterialIcons name="search" size={24} color="#666" style={SearchBarStyle.searchIcon} />
                        <TextInput
                            style={SearchBarStyle.searchInput}
                            placeholder={placeholder}
                            value={displayedRoom || query}
                            onChangeText={handleInputChange}
                        />
                        {Boolean(showClearButton && displayedRoom) && (
                            <TouchableOpacity onPress={handleClear} style={SearchBarStyle.clearButton}>
                                <MaterialIcons name="close" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {suggestions.length > 0 && (
                        <View style={SearchBarStyle.suggestionsContainer}>
                            <FlatList
                                data={suggestions}
                                keyExtractor={(item, index) => `${item.ref}-${index}`}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={SearchBarStyle.suggestionItem}
                                        onPress={() => handleSuggestionPress(item)}
                                    >
                                        <Text>{`${item.ref}`}</Text>
                                    </TouchableOpacity>
                                )}
                                style={SearchBarStyle.suggestionsList}
                                nestedScrollEnabled={true}
                                maxToRenderPerBatch={10}
                                initialNumToRender={10}
                                windowSize={5}
                                keyboardShouldPersistTaps="handled"
                            />
                        </View>
                    )}
                </View>
            )}
        </>
    );
};

export default RoomSearchBar;