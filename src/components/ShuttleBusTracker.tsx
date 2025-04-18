import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PointAnnotation } from '@rnmapbox/maps';
import axios from 'axios';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GoogleObject, BusDataResponse } from '../interfaces/ShuttleBusLocation'; 

const ShuttleBusTracker: React.FC = () => {
    const [busData, setBusData] = useState<GoogleObject | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Define the shuttle bus stop coordinates
    const busStops = [
        {
            id: 'SGW_STOP',
            name: 'SGW Campus Shuttle Stop',
            coordinate: [-73.5786672, 45.4969137], // Approximate coordinates for SGW stop
            campus: 'SGW'
        },
        {
            id: 'LOY_STOP',
            name: 'Loyola Campus Shuttle Stop',
            coordinate: [-73.639277, 45.457888], // Approximate coordinates for Loyola stop
            campus: 'LOY'
        }
    ];

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

    // Filter the busPoints array to include only buses (IDs starting with "BUS")
    const busPoints = busData.Points.filter((point) => point.ID.startsWith('BUS'));

    return (
        <>

             {/* Render the bus stops */}
             {busStops.map((stop) => (
                <PointAnnotation
                    key={stop.id}
                    id={stop.id}
                    coordinate={stop.coordinate}
                    title={stop.name}
                >
                    <MaterialCommunityIcons name="bus-stop" size={40} color="#912338" />
                </PointAnnotation>
            ))}

            {busPoints.map((point) => (
                <PointAnnotation
                    key={point.ID}
                    id={point.ID}
                    coordinate={[point.Longitude, point.Latitude]}
                >
                    <MaterialCommunityIcons name="bus-side" size={40} color="#912338" />
                </PointAnnotation>
            ))}
        </>
    );
};

export default ShuttleBusTracker;
