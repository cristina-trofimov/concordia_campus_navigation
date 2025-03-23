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

interface SearchBarProps {
    inputDestination: string;
}


const SearchBars: React.FC<SearchBarProps> = ({ inputDestination }) => {
    
    const { setRouteData, myLocationString, setIsTransit } = useCoords();

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState(inputDestination);
    const [time, setTime] = useState('');
    const { inFloorView, setInFloorView } = useIndoor();
    
    useEffect(() => {
        setDestination(inputDestination);

        // Added this because when selecting a building from map as a destination, coordinates is null, tso need to geocode it
        if (inputDestination && !destinationCoords) {
            if (origin) {
                getDirections(origin, inputDestination, selectedMode)
                .then(result => {
                    if (result && result.length > 0 && result[0].legs && result[0].legs[0].end_location) {
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

    const [originCoords, setOriginCoords] = useState<any>(null);
    const [destinationCoords, setDestinationCoords] = useState<any>(null);
    const transportModes = [
        { mode: "driving", icon: "car-outline", label: "Drive", time: "-" },
        { mode: "transit", icon: "bus-outline", label: "Public Transport", time: "-" },
        { mode: "walking", icon: "walk-outline", label: "Walk", time: "-" },
        { mode: "bicycling", icon: "bicycle-outline", label: "Bicycle", time: "-" },
    ];
    const [selectedMode, setSelectedMode] = useState("driving");
    const { isInsideBuilding } = useCoords();

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
                        {transportModes.map(({ mode, icon }) => (
                            <TouchableOpacity
                                key={mode}
                                style={SearchBarsStyle.transportButton}
                                onPress={() => setSelectedMode(mode)}
                                
                            >
                                <View style={SearchBarsStyle.transportButtonContent}>
                                    <Ionicons
                                        name={icon as keyof typeof Ionicons.glyphMap}
                                        size={24}
                                        color={selectedMode === mode ? "#912338" : "black"}
                                    />
                                    {selectedMode === mode}
                    
                                </View>
                            </TouchableOpacity>
                        ))}    
                    </View>
                    {/* Add this debug logging */}
                    {selectedMode === "transit" && console.log("mode selected:", selectedMode,  "coords:", origin, destinationCoords)}

                   
                    {/* Only render ShuttleBusTransit component when transit mode is selected */}
                    {selectedMode === "transit" && origin && destinationCoords && (
                    <ShuttleBusTransit
                        startLocation={origin}
                        endLocation={destinationCoords}
                        onSelect={(info) => {
                            // Set time to 35 min (30 min shuttle ride + 5 min walk)
                            setTime("35");

                            // Calculate wait time based on current time and departure time
                            const now = new Date();
                            const [hours, minutes] = info.nextDepartureTime.split(':').map(Number);
                            const departureTime = new Date();
                            departureTime.setHours(hours, minutes, 0, 0);
    
                            // Add 5 min walk time to current time
                            const arrivalAtStationTime = new Date(now.getTime() + 5 * 60 * 1000);
    
                            // Calculate wait time in minutes (time between arriving at station and shuttle departure)
                            let waitTimeMinutes = Math.max(0, Math.floor((departureTime.getTime() - arrivalAtStationTime.getTime()) / (60 * 1000)));
    
                            
                            // Create a custom route object using the info provided by ShuttleBusTransit
                            const customShuttleRoute = [{
                              legs: [{
                                steps: [
                                  {
                                    html_instructions: `Walk to ${info.shuttleStation} (Shuttle Bus Stop)`,
                                    duration: { text: "5 mins" }
                                  },
                                  {
                                    html_instructions: `Wait for ${waitTimeMinutes} min the next shuttle departing at ${info.nextDepartureTime}`,
                                    duration: { text: "${waitTimeMinutes} time" }
                                  },
                                  {
                                    html_instructions: `Take the Concordia Shuttle Bus from ${info.startCampusName} to ${info.endCampusName} Campus`,
                                    duration: { text: "30 mins" }
                                  },
                                  {
                                    html_instructions: `Walk to ${destination}`,
                                    duration: { text: "5 mins" }
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
                            
                            // Set isTransit to true so the detailed instructions show in DirectionsSteps
                            setIsTransit(true);
                            
                            console.log("User selected shuttle bus route");
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

                            {!inFloorView && (
                                <TouchableOpacity
                                    style={[
                                        SearchBarsStyle.button,
                                        {
                                            backgroundColor: isInsideBuilding ? "white" : "#ddd",
                                            borderColor: isInsideBuilding ? "#912338" : "grey",
                                            opacity: isInsideBuilding ? 1 : 0.5
                                        }
                                    ]}
                                    disabled={!isInsideBuilding} // Disable button when user is outside
                                    onPress={() => setInFloorView(true)}
                                >
                                    <View style={SearchBarsStyle.buttonContent}>
                                        <Entypo name="location" size={20} color={isInsideBuilding ? "#912338" : "grey"} />
                                        <Text style={[SearchBarsStyle.buttonText, { color: isInsideBuilding ? "#912338" : "grey" }]}>Floor View</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {inFloorView && (
                                <TouchableOpacity
                                    style={[
                                        SearchBarsStyle.button,
                                        {
                                            backgroundColor: "white",
                                            borderColor: "#912338",
                                            opacity: 1
                                        }
                                    ]}
                                    onPress={() => setInFloorView(false)}
                                >
                                    <View style={SearchBarsStyle.buttonContent}>
                                        <Entypo name="tree" size={20} color="#912338" />
                                        <Text style={[SearchBarsStyle.buttonText, { color: "#912338" }]}>Outside View</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};


export default SearchBars;