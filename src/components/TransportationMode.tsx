import { Entypo, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native';
import ShuttleBusTransit from './ShuttleBusTransit';
import { TransportationModeSTyle } from '../styles/TransportationModeStyle';
import { useCoords } from '../data/CoordsContext';
import getDirections from './Route';
import { useIndoor } from '../data/IndoorContext';

function TransportationMode({ inputDestination }: { inputDestination: string }) {

    const [destination, setDestination] = useState(inputDestination);
    const [origin, setOrigin] = useState('');
    const [destinationCoords, setDestinationCoords] = useState<any>(null);
    const transportModes = [
        { mode: "driving", icon: "car-outline", label: "Drive", time: "-", color: "#673AB7" },
        { mode: "transit", icon: "bus-outline", label: "Public Transport", time: "-", color: "#2196F3" },
        { mode: "walking", icon: "walk-outline", label: "Walk", time: "-", color: "#800000" },
        { mode: "bicycling", icon: "bicycle-outline", label: "Bicycle", time: "-", color: "#4CAF50" },
    ];
    const [selectedMode, setSelectedMode] = useState("driving");
    const { setRouteData, myLocationString, setIsTransit, isInsideBuilding } = useCoords();
    const [time, setTime] = useState('');
    const { inFloorView, setInFloorView } = useIndoor();

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




    return (




        <div>
            {origin.length > 0 && destination.length > 0 && (
                <>
                    {/* Selected Transport Mode Title */}
                    <View style={TransportationModeSTyle.selectedModeContainer}>
                        <Text style={TransportationModeSTyle.selectedModeText}>
                            {transportModes.find((t) => t.mode === selectedMode)?.label}
                        </Text>
                    </View>
                    {/* Transport Buttons with Time Estimates */}
                    <View style={TransportationModeSTyle.transportButtonContainer}>
                        {transportModes.map(({ mode, icon, color }) => (
                            <TouchableOpacity
                                key={mode}
                                style={TransportationModeSTyle.transportButton}
                                onPress={() => setSelectedMode(mode)}

                            >
                                <View style={TransportationModeSTyle.transportButtonContent}>
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
                    <View style={TransportationModeSTyle.timeAndButtonsContainer}>
                        <View style={TransportationModeSTyle.timeContainer}>
                            <Text style={TransportationModeSTyle.timeValue}>
                                {time}min
                            </Text>

                        </View>
                        {/* Buttons Container */}
                        <View style={TransportationModeSTyle.buttonsContainer}>
                            <TouchableOpacity style={[TransportationModeSTyle.button, { backgroundColor: "#912338" }, { borderColor: "#912338" }]}>
                                <View style={TransportationModeSTyle.buttonContent}>
                                    <Entypo name="direction" size={20} color="white" />
                                    <Text style={[TransportationModeSTyle.buttonText, { color: "white" }]}>Start</Text>
                                </View>
                            </TouchableOpacity>

                            {!inFloorView && (
                                <TouchableOpacity
                                    style={[
                                        TransportationModeSTyle.button,
                                        {
                                            backgroundColor: isInsideBuilding ? "white" : "#ddd",
                                            borderColor: isInsideBuilding ? "#912338" : "grey",
                                            opacity: isInsideBuilding ? 1 : 0.5
                                        }
                                    ]}
                                    disabled={!isInsideBuilding} // Disable button when user is outside
                                    onPress={() => setInFloorView(true)}
                                >
                                    <View style={TransportationModeSTyle.buttonContent}>
                                        <Entypo name="location" size={20} color={isInsideBuilding ? "#912338" : "grey"} />
                                        <Text style={[TransportationModeSTyle.buttonText, { color: isInsideBuilding ? "#912338" : "grey" }]}>Floor View</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {inFloorView && (
                                <TouchableOpacity
                                    style={[
                                        TransportationModeSTyle.button,
                                        {
                                            backgroundColor: "white",
                                            borderColor: "#912338",
                                            opacity: 1
                                        }
                                    ]}
                                    onPress={() => setInFloorView(false)}
                                >
                                    <View style={TransportationModeSTyle.buttonContent}>
                                        <Entypo name="tree" size={20} color="#912338" />
                                        <Text style={[TransportationModeSTyle.buttonText, { color: "#912338" }]}>Outside View</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </>
            )}
        </div>
    )
}

export default TransportationMode