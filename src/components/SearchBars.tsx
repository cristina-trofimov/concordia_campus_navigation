// SearchBars.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SearchBar from './SearchBar';
import getDirections from './Route';
import { useCoords } from '../data/CoordsContext';
import { useIndoor } from '../data/IndoorContext';
import { Ionicons } from "@expo/vector-icons";
import { SearchBarsStyle } from '../styles/SearchBarsStyle';
import analytics from '@react-native-firebase/analytics';
import ShuttleBusTransit from './ShuttleBusTransit';
import TransportModeSelector from './TransportationModeSelector';


function SearchBars(
    {
        inputDestination,
        setInputDestination,
        inputOrigin,
        setInputOrigin
    }:
        {
            inputDestination: string,
            setInputDestination: (value: string) => void
            inputOrigin: string,
            setInputOrigin: (value: string) => void
        }) {

    const { setRouteData, myLocationString, setIsTransit, originCoords, setOriginCoords, destinationCoords, setDestinationCoords } = useCoords();
    const { setInFloorView, setOriginRoom, setDestinationRoom } = useIndoor();

    const [origin, setOrigin] = useState(inputOrigin);
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

    useEffect(() => {
        setOrigin(inputOrigin);

        if (inputOrigin && !originCoords) {
            if (destination) {
                getDirections(inputOrigin, destination, selectedMode)
                    .then(result => {
                        if (result?.[0]?.legs?.[0]?.end_location) {
                            const coords = {
                                latitude: result[0].legs[0].end_location.lat,
                                longitude: result[0].legs[0].end_location.lng
                            };
                        }
                    })
                    .catch(error => {
                        console.error("Error getting coordinates for origin:", error);
                    });
            }
        }
    }, [inputOrigin]);

    // Need this to ensure destinationCoords gets updated
    // useEffect(() => {
    // }, [destinationCoords]);

    //EACH TIME YOU CHANGE LOCATION , THE ORIGIN DESTINATION BAR VALUE CHANGES
    useEffect(() => {
        if (myLocationString) {
            setOrigin(myLocationString);
        }
    }, [myLocationString]);

    // FIREBASE LOGGING EVENT 2
    const logNavigationEvent = async () => {
        if (!origin || !destination) {
            console.warn("Cannot log event: Origin or Destination is missing.");
            return;
        }

        try {
            if ((globalThis as any).isTesting && (globalThis as any).taskTimer.isStarted()) {
                console.log(destination);
                if (destination === "Uncle Tetsu, Rue Pierce, Montréal, QC, Canada") {
                    if (origin === myLocationString) {
                        console.log(origin);
                        if (selectedMode === "walking") {
                            const elapsedTime = (globalThis as any).taskTimer.stop();
                            await analytics().logEvent('Task_2_finished', {
                                origin: origin,
                                destination: destination,
                                mode_of_transport: selectedMode,
                                elapsed_time: elapsedTime / 1000,  // Add the elapsed time
                                user_id: (globalThis as any).userId,
                            });
                            console.log(`Custom Event Logged: Task 2 Finished`);
                            console.log(`Elapsed Time: ${elapsedTime / 1000} seconds`);  // Log in seconds for readability
                        } else {
                            await analytics().logEvent('Task_2_wrong_transportMode', {
                                origin: origin,
                                destination: destination,
                                mode_of_transport: selectedMode,
                                user_id: (globalThis as any).userId,
                            });
                            console.log(`Custom Event Logged: Task 2 error - wrong transport mode`);

                        }
                    } else {
                        await analytics().logEvent('Task_2_wrong_origin', {
                            origin: origin,
                            destination: destination,
                            mode_of_transport: selectedMode,
                            user_id: (globalThis as any).userId,
                        });
                        console.log(`Custom Event Logged: Task 2 error - wrong origin`);
                    }
                } else {
                    await analytics().logEvent('Task_2_wrong_destination', {
                        origin: origin,
                        destination: destination,
                        mode_of_transport: selectedMode,
                        user_id: (globalThis as any).userId,
                    });
                    console.log(`Custom Event Logged: Task 2 error - wrong destination`);
                }
            }

        } catch (error) {
            console.error("Error logging Firebase event:", error);
        }
    };


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
        setInputDestination("");
        setInputOrigin(myLocationString);
        setOrigin(myLocationString);
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
                    
                    <TransportModeSelector
                        transportModes={transportModes}
                        selectedMode={selectedMode}
                        setSelectedMode={setSelectedMode}
                    />

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
                                    const templateStep = routeCopy.legs[0].steps[0] ?? {};

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

                    {/* Total Time */}
                    <View style={SearchBarsStyle.timeContainer}>
                        <Text style={SearchBarsStyle.timeValue}>
                            {time}min
                        </Text>
                    </View>
                </>
            )}
        </View>
    );
};


export default SearchBars;