import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
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

const ShuttleBusTracker: React.FC = () => {
    const [busData, setBusData] = useState<GoogleObject | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBusData = async () => {
        try {
            // Step 1: Make a GET request to get the session cookies
            const getResponse = await axios.get('https://shuttle.concordia.ca/concordiabusmap/Map.aspx', {
                headers: {
                    'Host': 'shuttle.concordia.ca'
                }
            });
    
            // Log the entire response headers
            console.log('Response Headers:', getResponse.headers);
    
            // Extract cookies from the response (handle different cases)
            const cookies = getResponse.headers['set-cookie'] || getResponse.headers['Set-Cookie'];
    
            // Log the cookies
            console.log('Cookies:', cookies);
    
            if (!cookies) {
                console.warn('No cookies found in the response. Proceeding without cookies.');
                // Proceed without cookies (if the API allows it)
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
    
                // Set the bus data in the state
                setBusData(postResponse.data.d);
                setLoading(false);
            } else {
                // Proceed with cookies
                const postResponse = await axios.post<BusDataResponse>(
                    'https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject',
                    {},
                    {
                        headers: {
                            'Host': 'shuttle.concordia.ca',
                            'Content-Length': '0',
                            'Content-Type': 'application/json; charset=UTF-8',
                            'Cookie': cookies.join('; ')
                        }
                    }
                );
    
                // Log the raw response data
                console.log('Raw Response:', postResponse.data);
    
                // Log the bus data
                console.log('Bus Data:', postResponse.data.d);
    
                // Set the bus data in the state
                setBusData(postResponse.data.d);
                setLoading(false);
            }
        } catch (err) {
            console.error('Error fetching bus data:', err);
            setError(err.message);
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchBusData();

        // Optionally, set up an interval to fetch data every 15 seconds
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

    return (
        <View style={styles.container}>
            {busData?.Points.map((point, index) => (
                <View key={index} style={styles.pointContainer}>
                    <Text style={styles.pointText}>ID: {point.ID}</Text>
                    <Text style={styles.pointText}>Latitude: {point.Latitude}</Text>
                    <Text style={styles.pointText}>Longitude: {point.Longitude}</Text>
                </View>
            ))}
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    pointContainer: {
        marginBottom: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        width: '100%',
    },
    pointText: {
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});

export default ShuttleBusTracker;