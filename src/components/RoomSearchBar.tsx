import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { point } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { SearchBarStyle } from "../styles/SearchBarStyle";
import { featureMap, floorNameFormat } from "../components/IndoorMap";
import { buildingFloorAssociations } from "../data/buildingFloorAssociations";
import { fixedBuildingFeatures } from "./BuildingCoordinates";
import { useCoords } from "../data/CoordsContext";
import { useFloorSelection } from "./FloorSelector";

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
    const { highlightedBuilding } = useCoords();
    const { handleSelectFloor } = useFloorSelection();

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
        const id = getBuildingIDFromCoords(location);
        setBuildingID(id);

        if (id.length > 0) {
            const buildingFloors = buildingFloorAssociations.filter(
                association => association.buildingID === id
            );

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

    // TO-DO: once pressed, put pin on the map
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
            // only change to that floor if inside the building
            if (highlightedBuilding.properties.id === buildingID) {
                handleSelectFloor(floorNameFormat(room.floor));
            }
        };
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
            {buildingFloorAssociations.some(association => association.buildingID === getBuildingIDFromCoords(location)) && (
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
                            <ScrollView style={SearchBarStyle.suggestionsList}>
                                {suggestions.map((item, index) => (
                                    <TouchableOpacity
                                        key={`${item.ref}-${index}`}
                                        style={SearchBarStyle.suggestionItem}
                                        onPress={() => handleSuggestionPress(item)}
                                    >
                                        <Text>{`${item.ref}`}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            )}
        </>
    );
};

export default RoomSearchBar;