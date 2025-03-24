import React, { useState, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import SearchBar from './SearchBar';
import getDirections from './Route';
import { useCoords } from '../data/CoordsContext';
import { useIndoor } from '../data/IndoorContext';
import { SearchBarsStyle } from '../styles/SearchBarsStyle';


function SearchBars ({ inputDestination } : {inputDestination : string}) {
    
    const { setRouteData, myLocationString, setIsTransit } = useCoords();

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState(inputDestination);
    const [time, setTime] = useState('');
    const { setInFloorView } = useIndoor();
    const [originCoords, setOriginCoords] = useState<any>(null);
    const [destinationCoords, setDestinationCoords] = useState<any>(null);
    const [selectedMode] = useState("driving");
    

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
        </View>
    );
};


export default SearchBars;