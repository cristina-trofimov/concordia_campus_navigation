import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import { PointAnnotation } from '@rnmapbox/maps';
import axios from 'axios';
import { GoogleObject, BusDataResponse } from '../interfaces/ShuttleBusLocation'; // Import the types

const ShuttleBusTracker: React.FC = () => {
    const [busData, setBusData] = useState<GoogleObject | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBusData = async () => {
        try {
            // Make a POST request to get the bus data
            const postResponse = await axios.post<BusDataResponse>(
                'https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject',
                {},
                {
                    headers: {
                        'Host': 'shuttle.concordia.ca',
                        'Content-Length': '0',
                        'Content-Type': 'application/json; charset=UTF-8',
                    }
                }
            );

            // Set the bus data to state
            setBusData(postResponse.data.d);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching bus data:', err);
            setError('Error fetching bus data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusData();

        // Set up an interval to fetch data every 15 seconds
        const interval = setInterval(fetchBusData, 15000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    if (!busData || !busData.Points) {
        return null;
    }

    // Filter the Points array to include only buses (IDs starting with "BUS")
    const busPoints = busData.Points.filter((point) => point.ID.startsWith('BUS'));

    return (
        <>
            {busPoints.map((point) => (
                <PointAnnotation
                    key={point.ID}
                    id={point.ID}
                    coordinate={[point.Longitude, point.Latitude]}
                >
                    <Image
                        source={require('../resources/images/ShuttleBus-Icon.png')}
                        style={{ width: 100, height: 40 }}
                    />
                </PointAnnotation>
            ))}
        </>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});

export default ShuttleBusTracker;
