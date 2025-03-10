import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import axios from 'axios';

// Define types inline
type Point = {
    PointStatus: string;
    Address: string;
    ID: string;
    IconImage: string;
    IconShadowImage: string;
    IconImageWidth: number;
    IconShadowWidth: number;
    IconShadowHeight: number;
    IconAnchor_posX: number;
    IconAnchor_posY: number;
    InfoWindowAnchor_posX: number;
    InfoWindowAnchor_posY: number;
    Draggable: boolean;
    IconImageHeight: number;
    Latitude: number;
    Longitude: number;
    InfoHTML: string;
    ToolTip: string;
};

type GoogleObject = {
    __type: string;
    Directions: {
        Addresses: any[];
        Locale: string;
        ShowDirectionInstructions: boolean;
        HideMarkers: boolean;
        PolylineOpacity: number;
        PolylineWeight: number;
        PolylineColor: string;
    };
    Points: Point[];
    Polylines: any[];
    Polygons: any[];
    CenterPoint: Point;
    ZoomLevel: number;
    ShowZoomControl: boolean;
    RecenterMap: boolean;
    AutomaticBoundaryAndZoom: boolean;
    ShowTraffic: boolean;
    ShowMapTypesControl: boolean;
    Width: string;
    Height: string;
    MapType: string;
    APIKey: string;
    APIVersion: string;
};

type BusDataResponse = {
    d: GoogleObject;
};

type ShuttleBusTrackerProps = {
    setBusData: (data: GoogleObject | null) => void; // Callback to pass bus data to the parent
};

const ShuttleBusTracker: React.FC<ShuttleBusTrackerProps> = ({ setBusData }) => {
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

            // Log the raw response data
            console.log('Raw Response:', postResponse.data);

            // Log the bus data
            console.log('Bus Data:', postResponse.data.d);

            // Pass the bus data to the parent component
            setBusData(postResponse.data.d);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching bus data:', err);
            setError(err.message);
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

    return null; // No UI needed, data is passed to the parent
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