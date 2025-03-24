// SearchBars.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SearchBar from './SearchBar';
import getDirections from './Route';
import { useCoords } from '../data/CoordsContext';
import { useIndoor } from '../data/IndoorContext';
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { SearchBarsStyle } from '../styles/SearchBarsStyle';
import ShuttleBusTransit from './ShuttleBusTransit';
import IndoorViewButton from './IndoorViewButton';


function SearchBars({ inputDestination }: { inputDestination: string }) {

    const { setRouteData, myLocationString, setIsTransit } = useCoords();
    const { inFloorView, setInFloorView } = useIndoor();

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState(inputDestination);

    const [originCoords, setOriginCoords] = useState<any>(null);
    const [destinationCoords, setDestinationCoords] = useState<any>(null);

    const [time, setTime] = useState('');

    const transportModes = [
        { mode: "driving", icon: "car-outline", label: "Drive", time: "-", color: "#673AB7" },
        { mode: "transit", icon: "bus-outline", label: "Public Transport", time: "-", color: "#2196F3" },
        { mode: "walking", icon: "walk-outline", label: "Walk", time: "-", color: "#800000" },
        { mode: "bicycling", icon: "bicycle-outline", label: "Bicycle", time: "-", color: "#4CAF50" },
    ];
    const [selectedMode, setSelectedMode] = useState("driving");
    const { isInsideBuilding } = useCoords();

    useEffect(() => {
        setDestination(inputDestination);

        // Added this because when selecting a building from map as a destination, coordinates is null, tso need to geocode it
        if (inputDestination && !destinationCoords) {
            if (origin) {
                getDirections(origin, inputDestination, selectedMode)
                    .then(result => {
                        if (result?.[0]?.legs?.[0]?.end_location) {
                            const coords = {
                                latitude: result[0].legs[0].end_location.lat,
                                longitude: result[0].legs[0].end_location.lng
                            };
                            setDestinationCoords(coords);
                        }
                    })
                    .catch(error => {
                        console.error("Error getting coordinates for destination:", error);
                    });
            }
        }
    }, [inputDestination]);

    //EACH TIME YOU CHANGE LOCATION , THE ORIGIN DESTINATION BAR VALUE CHANGES
    useEffect(() => {
        if (myLocationString) {
            setOrigin(myLocationString);
        }
    }, [myLocationString]);



    //WHEN ORIGIN SEARCH BAR VALUE CHANGES METHOD HERE TO GETROUTEDATA
    const handleOriginSelect = useCallback(async (selectedOrigin: string, coords: any) => {
        setOrigin(selectedOrigin);
        setOriginCoords(coords);

        if (destination && selectedOrigin) {
            try {
                //GETS THE COORDS FOR THE PATHLINE
                const fetchedCoords = await getDirections(selectedOrigin, destination, selectedMode);
                if (fetchedCoords && fetchedCoords.length > 0) {
                    setRouteData(fetchedCoords);
                    setTime(fetchedCoords[0].legs[0].duration.text);
                    console.log("Origin", time);
                    //WHEN SETROUTEDATA() RUNS YOU SHOULD DO THE UI CHANGE!
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

    //WHEN DESTINATION SEARCH BAR VALUE CHANGES METHOD HERE TO GETROUTEDATA
    const handleDestinationSelect = useCallback(async (selectedDestination: string, coords: any) => {
        setDestination(selectedDestination);
        setDestinationCoords(coords);

        if (origin && selectedDestination) {
            try {
                const fetchedCoords = await getDirections(origin, selectedDestination, selectedMode);
                if (fetchedCoords && fetchedCoords.length > 0) {
                    setRouteData(fetchedCoords);
                    let durationText = fetchedCoords[0].legs[0].duration.text;
                    durationText = durationText.replace(/hours?/g, 'h').replace(/mins?/g, '');
                    setTime(durationText)
                    console.log("Destination", time);
                    //set isTransit to true
                    if (selectedMode == "transit") { setIsTransit(true); } else { setIsTransit(false); };
                    //WHEN SETROUTEDATA() RUNS YOU SHOULD DO THE UI CHANGE!
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

    // WHEN YOU CLICK THE LITTLE X ON THE DESTINATION BAR IT DELETES ALL VALUE
    const handleClearDestination = useCallback(() => {
        setDestination("");
        setDestinationCoords(null);
        setRouteData(null);
        setInFloorView(false);
    }, [setRouteData]);

    useEffect(() => {
        if (origin && destination) {
            handleDestinationSelect(destination, destinationCoords);
        }
    }, [selectedMode, origin, destination, originCoords, destinationCoords, handleOriginSelect, handleDestinationSelect]);

    return (
        <View style={SearchBarsStyle.container}>

            {destination.length > 0 && (
                <SearchBar
                    placeholder="Origin"
                    onSelect={handleOriginSelect}
                    setCoords={setOriginCoords}
                    defaultValue={origin}
                />
            )}
            <SearchBar
                placeholder="Destination"
                onSelect={handleDestinationSelect}
                setCoords={setDestinationCoords}
                defaultValue={destination}
                showClearButton={true}
                onClear={handleClearDestination}
            />

            {origin.length > 0 && destination.length > 0 && (
                <>
                    {/* Selected Transport Mode Title */}
                    <View style={SearchBarsStyle.selectedModeContainer}>
                        <Text style={SearchBarsStyle.selectedModeText}>
                            {transportModes.find((t) => t.mode === selectedMode)?.label}
                        </Text>
                    </View>
                    {/* Transport Buttons with Time Estimates */}
                    <View style={SearchBarsStyle.transportButtonContainer}>
                        {transportModes.map(({ mode, icon, color }) => (
                            <TouchableOpacity
                                key={mode}
                                style={SearchBarsStyle.transportButton}
                                onPress={() => setSelectedMode(mode)}

                            >
                                <View style={SearchBarsStyle.transportButtonContent}>
                                    <Ionicons
                                        name={icon as keyof typeof Ionicons.glyphMap}
                                        size={24}
                                        color={selectedMode === mode ? color : "black"}
                                    />
                                    {selectedMode === mode}

                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {/* Add this debug logging */}
                    {selectedMode === "transit" && console.log("mode selected:", selectedMode, "coords:", origin, destinationCoords)}


                    {/* Only render ShuttleBusTransit component when transit mode is selected */}
                    {!!(selectedMode === "transit" && origin && destinationCoords) && (
                        <ShuttleBusTransit
                            startLocation={origin}
                            endLocation={destinationCoords}
                            onSelect={(info) => {
                                // Calculate wait time based on current time and departure time
                                const now = new Date();
                                const [hours, minutes] = info.nextDepartureTime.split(':').map(Number);
                                const departureTime = new Date();
                                departureTime.setHours(hours, minutes, 0, 0);

                                // Add 5 min walk time to current time
                                const arrivalAtStationTime = new Date(now.getTime() + 5 * 60 * 1000);

                                // Calculate wait time in minutes
                                let waitTimeMinutes = Math.max(0, Math.floor((departureTime.getTime() - arrivalAtStationTime.getTime()) / (60 * 1000)));

                                // First get directions to the shuttle station
                                getDirections(origin, info.shuttleStation, "walking")
                                    .then(stationRouteCoords => {
                                        if (stationRouteCoords && stationRouteCoords.length > 0) {
                                            // Create a modified version of the route data that includes all steps
                                            const customShuttleRoute = [{
                                                ...stationRouteCoords[0], // Use the actual route data to the station
                                                legs: [{
                                                    ...stationRouteCoords[0].legs[0],
                                                    steps: [
                                                        {
                                                            html_instructions: `Walk to ${info.shuttleStation} (Shuttle Bus Stop)`,
                                                            duration: { text: "5 mins" }
                                                        },
                                                        {
                                                            html_instructions: `Wait for ${waitTimeMinutes} min until the shuttle departing at ${info.nextDepartureTime}`,
                                                            duration: { text: `${waitTimeMinutes} mins` }
                                                        },
                                                        {
                                                            html_instructions: `Take the Concordia Shuttle Bus from ${info.startCampusName} to ${info.endCampusName} Campus`,
                                                            duration: { text: "30 mins" }
                                                        },
                                                        {
                                                            html_instructions: `Arrive at your destination`,
                                                            duration: { text: "0 mins" }
                                                        }
                                                    ],
                                                    duration: { text: "35 mins" }
                                                }]
                                            }];

                                            // Set the route data to our custom route
                                            setRouteData(customShuttleRoute);

                                            // Set time to include walk + wait + shuttle time
                                            const walkTimeMinutes = Math.ceil(stationRouteCoords[0].legs[0].duration.value / 60);
                                            const totalTime = walkTimeMinutes + waitTimeMinutes + 30; // walk + wait + 30 min shuttle
                                            setTime(totalTime.toString());

                                            // Set isTransit to true
                                            setIsTransit(true);

                                            console.log("User selected shuttle bus route");
                                        } else {
                                            console.warn("Couldn't get directions to shuttle station");
                                        }
                                    })
                                    .catch(error => {
                                        console.error("Error getting directions to shuttle station:", error);
                                    });
                            }}
                        />
                    )}

                    {/* Total Time, Start Button, and Floor/Outside View Button */}
                    <View style={SearchBarsStyle.timeAndButtonsContainer}>
                        <View style={SearchBarsStyle.timeContainer}>
                            <Text style={SearchBarsStyle.timeValue}>
                                {time}min
                            </Text>

                        </View>
                        {/* Buttons Container */}
                        <View style={SearchBarsStyle.buttonsContainer}>
                            <TouchableOpacity style={[SearchBarsStyle.button, { backgroundColor: "#912338" }, { borderColor: "#912338" }]}>
                                <View style={SearchBarsStyle.buttonContent}>
                                    <Entypo name="direction" size={20} color="white" />
                                    <Text style={[SearchBarsStyle.buttonText, { color: "white" }]}>Start</Text>
                                </View>
                            </TouchableOpacity>

                            <IndoorViewButton inFloorView={inFloorView} />
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};


export default SearchBars;