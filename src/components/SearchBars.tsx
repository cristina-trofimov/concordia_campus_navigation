// SearchBars.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import SearchBar from './SearchBar';
import getDirections from './Route';
import { useCoords } from '../data/CoordsContext';
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";

const SearchBars: React.FC = () => {
    const { setRouteData } = useCoords();
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [originCoords, setOriginCoords] = useState<any>(null);
    const [destinationCoords, setDestinationCoords] = useState<any>(null);
    const [transportModes, setTransportModes] = useState([
        { mode: "driving", icon: "car-outline", label: "Drive", time: "0" },
        { mode: "transit", icon: "bus-outline", label: "Public Transport", time: "0" },
        { mode: "walking", icon: "walk-outline", label: "Walk", time: "0" },
        { mode: "biking", icon: "bicycle-outline", label: "Bicycle", time: "0" },
    ]);
    const [selectedMode, setSelectedMode] = useState("driving");
    const { isInsideBuilding } = useCoords();

    const handleOriginSelect = useCallback(async (selectedOrigin: string, coords: any) => {
        setOrigin(selectedOrigin);
        setOriginCoords(coords);

        if (destination && selectedOrigin) {
            try {
                const fetchedCoords = await getDirections(selectedOrigin, destination, selectedMode);
                if (fetchedCoords && fetchedCoords.length > 0) {
                    setRouteData(fetchedCoords);

                } else {
                    console.warn("No coordinates received or empty result from getDirections");
                    setRouteData(null);
                }
            } catch (error) {
                console.error("Error in getDirections:", error);
                setRouteData(null);
            }
        } else {
            setRouteData(null);
        }
    }, [destination, setRouteData, selectedMode]);

    const handleDestinationSelect = useCallback(async (selectedDestination: string, coords: any) => {
        setDestination(selectedDestination);
        setDestinationCoords(coords);

        if (origin && selectedDestination) {
            try {
                const fetchedCoords = await getDirections(origin, selectedDestination, selectedMode);
                if (fetchedCoords && fetchedCoords.length > 0) {
                    setRouteData(fetchedCoords);

                } else {
                    console.warn("No coordinates received or empty result from getDirections");
                    setRouteData(null);
                }
            } catch (error) {
                console.error("Error in getDirections:", error);
                setRouteData(null);
            }
        } else {
            setRouteData(null);
        }
    }, [origin, setRouteData, selectedMode]);

    useEffect(() => {
        if (origin && destination) {

            handleDestinationSelect(destination, destinationCoords);
        }
    }, [selectedMode, origin, destination, originCoords, destinationCoords, handleOriginSelect, handleDestinationSelect]);

    return (
        <View style={styles.container}>
            <SearchBar
                placeholder="Origin"
                onSelect={handleOriginSelect}
                setCoords={setOriginCoords}
            />
            <SearchBar
                placeholder="Destination"
                onSelect={handleDestinationSelect}
                setCoords={setDestinationCoords}
            />

            {origin.length > 0 && destination.length > 0 && (
                <>
                    {/* Selected Transport Mode Title */}
                    <View style={styles.selectedModeContainer}>
                        <Text style={styles.selectedModeText}>
                            {transportModes.find((t) => t.mode === selectedMode)?.label}
                        </Text>
                    </View>

                    {/* Transport Buttons with Time Estimates */}
                    <View style={styles.transportButtonContainer}>
                        {transportModes.map(({ mode, icon, time }) => (
                            <TouchableOpacity
                                key={mode}
                                style={styles.transportButton}
                                onPress={() => setSelectedMode(mode)}
                            >
                                <View style={styles.transportButtonContent}>
                                    <Ionicons
                                        name={icon as keyof typeof Ionicons.glyphMap}
                                        size={24}
                                        color={selectedMode === mode ? "#912338" : "black"}
                                    />
                                    <Text style={[styles.timeText, { color: selectedMode === mode ? "#912338" : "black" }]}>
                                        {time} min
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Total Time, Start Button, and Floor/Outside View Button */}
                    <View style={styles.timeAndButtonsContainer}>
                        {/* Time Container */}
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeValue}>
                                {transportModes.find((t) => t.mode === selectedMode)?.time}
                            </Text>
                            <Text style={styles.timeUnit}>min</Text>
                        </View>

                        {/* Buttons Container */}
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: "#912338" }, { borderColor: "#912338" }]}>
                                <View style={styles.buttonContent}>
                                    <Entypo name="direction" size={20} color="white" />
                                    <Text style={[styles.buttonText, { color: "white" }]}>Start</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: isInsideBuilding ? "white" : "#ddd",
                                        borderColor: isInsideBuilding ? "#912338" : "grey",
                                        opacity: isInsideBuilding ? 1 : 0.5
                                    }
                                ]}
                                disabled={!isInsideBuilding} // Disable button when user is outside
                            >
                                <View style={styles.buttonContent}>
                                    <Entypo name="location" size={20} color={isInsideBuilding ? "#912338" : "grey"} />
                                    <Text style={[styles.buttonText, { color: isInsideBuilding ? "#912338" : "grey" }]}>Floor View</Text>
                                </View>
                            </TouchableOpacity>

                            {/* When implementing floor plans, switch between floor and outside view !!! WILL BE USED IN THE FUTURE
                            <TouchableOpacity style={styles.button}>
                                <View style={styles.buttonContent}>
                                    <Entypo name="tree" size={20} color="black" />
                                    <Text style={styles.buttonText}>Outside View</Text>
                                </View>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    transportButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    transportButton: {
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
    },
    instructionContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    selectedModeContainer: {
        width: "100%",
        alignItems: "flex-start",
        paddingHorizontal: 20,
    },
    selectedModeText: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "left",
        marginVertical: 5,
    },
    transportButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    timeText: {
        fontSize: 12,
    },
    timeAndButtonsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    timeContainer: {
        alignItems: "center",
        marginRight: 10,
    },
    timeValue: {
        fontSize: 18,
        fontWeight: "bold",
    },
    timeUnit: {
        fontSize: 14,
        color: "#666",
    },
    buttonsContainer: {
        flexDirection: "row",
        gap: 30,
    },
    button: {
        paddingVertical: 7,
        paddingHorizontal: 15,
        borderRadius: 25,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "500",
    },
});

export default SearchBars;