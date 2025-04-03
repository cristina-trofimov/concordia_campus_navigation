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

    const { setRouteData, myLocationString, setIsTransit, originCoords, setOriginCoords, destinationCoords, setDestinationCoords } = useCoords();
    const { inFloorView, setInFloorView, setOriginRoom, setDestinationRoom } = useIndoor();

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState(inputDestination);

    const [time, setTime] = useState('');

    const transportModes = [
        { mode: "driving", icon: "car-outline", label: "Drive", time: "-", color: "#673AB7" },
        { mode: "transit", icon: "bus-outline", label: "Public Transport", time: "-", color: "#2196F3" },
        { mode: "walking", icon: "walk-outline", label: "Walk", time: "-", color: "#800000" },
        { mode: "bicycling", icon: "bicycle-outline", label: "Bicycle", time: "-", color: "#4CAF50" },
    ];
    const [selectedMode, setSelectedMode] = useState("driving");

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
                        }
                    })
                    .catch(error => {
                        console.error("Error getting coordinates for destination:", error);
                    });
            }
        }
    }, [inputDestination]);

    // Need this to ensure destinationCoords gets updated
    useEffect(() => {
    }, [destinationCoords]);

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
        setOriginRoom(null);
        setDestinationRoom(null);
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

                    {/* Only render ShuttleBusTransit component when transit mode is selected */}
                    {!!(selectedMode === "transit" && origin && destinationCoords) && (
                        <ShuttleBusTransit
                            startLocation={origin}
                            endLocation={destinationCoords}
                            onSelect={(info) => {
                                Promise.all([
                                    getDirections(origin, info.startShuttleStation, "walking"),
                                    getDirections(info.endShuttleStation, destination, "walking"),
                                    getDirections(info.startShuttleStation, info.endShuttleStation, "driving")
                                ]).then(([stationRouteCoords, endRouteCoords, shuttleRouteCoords]) => {
                                    if (!stationRouteCoords?.length || !endRouteCoords?.length || !shuttleRouteCoords?.length) {
                                        console.error("Missing route data");
                                        return;
                                    }

                                    // Create deep copy of the first route segment
                                    const routeCopy = JSON.parse(JSON.stringify(stationRouteCoords[0]));

                                    // Calculate times
                                    const now = new Date();
                                    const [hours, minutes] = info.nextDepartureTime.split(':').map(Number);
                                    const departureTime = new Date();
                                    departureTime.setHours(hours, minutes, 0, 0);
                                    const arrivalAtStationTime = new Date(now.getTime() + routeCopy.legs[0].duration.value * 1000);
                                    const waitTimeMinutes = Math.max(0, Math.floor((departureTime.getTime() - arrivalAtStationTime.getTime()) / (60 * 1000)));
                                    const walkToStationMinutes = Math.ceil(routeCopy.legs[0].duration.value / 60);
                                    const walkFromStationMinutes = Math.ceil(endRouteCoords[0].legs[0].duration.value / 60);

                                    // Create template step object for custom steps
                                    const templateStep = routeCopy.legs[0].steps[0] || {};

                                    // Create all steps with hidden instructions for route visualization
                                    const allHiddenSteps = [
                                        // Walking to station steps
                                        ...routeCopy.legs[0].steps.map((step: { html_instructions: string; }) => {
                                            step.html_instructions = "HIDDEN_STEP_DO_NOT_DISPLAY";
                                            return step;
                                        }),

                                        // Shuttle route steps (marked for dashed line)
                                        ...shuttleRouteCoords[0].legs[0].steps.map((step: { html_instructions: string; is_shuttle_route: boolean; }) => {
                                            step.html_instructions = "HIDDEN_STEP_DO_NOT_DISPLAY";
                                            return step;
                                        }),

                                        // Walking from station steps
                                        ...endRouteCoords[0].legs[0].steps.map((step: { html_instructions: string; }) => {
                                            step.html_instructions = "HIDDEN_STEP_DO_NOT_DISPLAY";
                                            return step;
                                        })
                                    ];

                                    // Create visible custom instruction steps
                                    const visibleSteps = [
                                        {
                                            ...templateStep,
                                            html_instructions: `Walk to ${info.startShuttleStation} (Shuttle Bus Stop)`,
                                            duration: routeCopy.legs[0].duration,
                                            distance: routeCopy.legs[0].distance
                                        },
                                        {
                                            ...templateStep,
                                            html_instructions: `Wait for ${waitTimeMinutes} min until the shuttle departing at ${info.nextDepartureTime}`,
                                            duration: { text: `${waitTimeMinutes} mins`, value: waitTimeMinutes * 60 },
                                            distance: { text: "", value: 0 }
                                        },
                                        {
                                            ...templateStep,
                                            html_instructions: `Take the Concordia Shuttle Bus from ${info.startCampusName} to ${info.endCampusName} Campus`,
                                            duration: { text: "30 mins", value: 1800 },
                                            distance: { text: "8.3 km", value: 8300 }
                                        },
                                        {
                                            ...templateStep,
                                            html_instructions: `Walk from ${info.endShuttleStation} to your destination`,
                                            duration: endRouteCoords[0].legs[0].duration,
                                            distance: endRouteCoords[0].legs[0].distance
                                        }
                                    ];

                                    // Update the complete route
                                    routeCopy.legs[0].steps = [...allHiddenSteps, ...visibleSteps];

                                    // Update the UI
                                    setRouteData([routeCopy]);

                                    setTime((walkToStationMinutes + waitTimeMinutes + 30 + walkFromStationMinutes).toString());

                                    setIsTransit(true);

                                }).catch(error => {
                                    console.error("Error creating shuttle route:", error);
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