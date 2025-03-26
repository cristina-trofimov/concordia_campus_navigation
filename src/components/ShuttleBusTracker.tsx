import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PointAnnotation } from '@rnmapbox/maps';
import axios from 'axios';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GoogleObject, BusDataResponse } from '../interfaces/ShuttleBusLocation'; 

const ShuttleBusTracker: React.FC = () => {
    const [busData, setBusData] = useState<GoogleObject | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchBusData = async () => {
        try {
             // Step 1: First make a GET request to get session cookies
            await axios.get('https://shuttle.concordia.ca/concordiabusmap/Map.aspx', {
                headers: {
                    'Host': 'shuttle.concordia.ca'
                }
            });
      
            // Step 2: Then make the POST request with cookies from the previous request
            const response = await axios.post<BusDataResponse>(
                'https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject',
                {}, 
                {
                    headers: {
                        'Host': 'shuttle.concordia.ca',
                        'Content-Length': '0',
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }
            );

            setBusData(response.data.d);

            setLoading(false);

        } catch (err) {
            console.error('Error fetching bus data:', err);
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
            <View >
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (busData?.Points == null) {
        return null;
    }

    // Filter the Pbusoints array to include only buses (IDs starting with "BUS")
    const busPoints = busData.Points.filter((point) => point.ID.startsWith('BUS'));

    return (
        <>
            {busPoints.map((point) => (
                <PointAnnotation
                    key={point.ID}
                    id={point.ID}
                    coordinate={[point.Longitude, point.Latitude]}
                >
                    <MaterialCommunityIcons name="bus-side" size={62} color="#912338" />
                </PointAnnotation>
            ))}
        </>
    );
};

export default ShuttleBusTracker;
