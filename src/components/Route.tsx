import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native'; // Import View and Text
import Polyline from '@mapbox/polyline';



interface DirectionsProps {
    origin: string | null;
    destination: string | null;
}

function Directions({ origin, destination }: DirectionsProps) {
    const [directions, setDirections] = useState<any>(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [decodedPolyline, setDecodedPolyline] = useState<any>(null);
    const [decodedCoords, setDecodedCoords] = useState<any>(null);

    useEffect(() => {
        async function getDirections(origin: string, destination: string) {
            setIsLoading(true);
            try {
                if (!origin || !destination) {
                    throw new Error("Origin and destination must be provided.");
                }

                const response = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
                    params: {
                        origin,
                        destination,
                        key: 'AIzaSyDVeg6jawwGFbwdBH7y_qlpXfXuZkkLtUU' // **REPLACE WITH YOUR ACTUAL API KEY**
                    }
                });

                if (response.data.status === "OK") {
                    setDirections(response.data);
                    setDecodedPolyline(Polyline.decode(response.data.routes[0].overview_polyline.points));

                    setError(null);
                    console.log("Directions API Response:", response.data);
                    console.log("Polyline:", decodedPolyline);
                } else {
                    setDirections(null);
                }
            } catch (error: any) {
                console.error('Error fetching directions:', error);
                setDirections(null);
                if (axios.isAxiosError(error)) {
                    console.error('Axios Response:', error.response);
                }
            } finally {
                setIsLoading(false);
            }
        }

        if (origin && destination) {
            getDirections(origin, destination);
        } else {
            setDirections(null);
            setError(null);
            setIsLoading(false);
        }
    }, [origin, destination]);

    return (
        <View>
            {directions && (
                <View> {/* Use View */}

                <Text>Decoded Polyline:</Text>
                <Text>{decodedPolyline}</Text>

                </View>
            )}
        </View>
    );
}

export default Directions;


