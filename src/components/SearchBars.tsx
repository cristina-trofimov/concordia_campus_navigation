// SearchBars.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import SearchBar from './SearchBar'; // Import your SearchBar component
import getDirections from './Route'; // Import your getDirections function
import { useCoords } from '../data/CoordsContext'; // Import your context

const SearchBars: React.FC = () => {
    const { setCoords } = useCoords();
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [originCoords, setOriginCoords] = useState<any>(null);
    const [destinationCoords, setDestinationCoords] = useState<any>(null);

    const getRoute = useCallback(async (currentOrigin: string, currentDestination: string) => {
        try {
            const fetchedCoords = await getDirections(currentOrigin, currentDestination);
            if (fetchedCoords && fetchedCoords.length > 0) {
                setCoords(fetchedCoords);
                console.log("Route Coordinates:", fetchedCoords);
            } else {
                console.warn("No coordinates received or empty result from getDirections");
                setCoords(null);
            }
        } catch (error) {
            console.error("Error in getDirections:", error);
            setCoords(null);
        }
    }, [setCoords, getDirections]);

    const handleOriginSelect = useCallback(async (selectedOrigin: string, coords: any) => {
        setOrigin(selectedOrigin);
        setOriginCoords(coords);
        if (destinationCoords) {
            getRoute(selectedOrigin, destination);
        }
    }, [destinationCoords, getRoute]);

    const handleDestinationSelect = useCallback(async (selectedDestination: string, coords: any) => {
        setDestination(selectedDestination);
        setDestinationCoords(coords);
        if (originCoords) {
            getRoute(origin, selectedDestination);
        }
    }, [originCoords, getRoute]);

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
});

export default SearchBars;