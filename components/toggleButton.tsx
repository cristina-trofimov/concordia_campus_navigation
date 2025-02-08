// ToggleButton.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';

interface ToggleButtonProps {
    mapRef: React.RefObject<Mapbox.MapView>;
    sgwCoords: { latitude: number; longitude: number };
    loyolaCoords: { latitude: number; longitude: number };
    onCampusChange: (isSGW: boolean) => void; // Callback function
    initialCampus?: boolean; // Optional: Initial campus (SGW if true)
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ mapRef, sgwCoords, loyolaCoords, onCampusChange, initialCampus = true }) => {
    const [isSGW, setIsSGW] = useState(initialCampus);
    const translateX = useRef(new Animated.Value(initialCampus ? 0 : 40)).current;

    const toggleSwitch = () => {
        Animated.timing(translateX, {
            toValue: isSGW ? 40 : 0,
            duration: 300,
            useNativeDriver: true, // Try true, fallback to false
        }).start(() => {
            const newIsSGW = !isSGW;
            setIsSGW(newIsSGW);
            onCampusChange(newIsSGW); // Call the callback function
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.slider} onPress={toggleSwitch} activeOpacity={1}>
                <Animated.View style={[styles.knob, { transform: [{ translateX }] }]}>
                    <Text style={styles.label}>{isSGW ? 'SGW' : 'Loyola'}</Text>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginTop: 10,  // Or adjust as needed
        backgroundColor: 'rgba(0,0,0,0.5)', // Optional: semi-transparent background
        borderRadius: 20, // Optional: rounded corners
    },
    slider: {
        width: 80,
        height: 40,
        backgroundColor: '#ccc',
        borderRadius: 20,
        justifyContent: 'center',
        padding: 5,
    },
    knob: {
        width:40,
        height: 40,
        backgroundColor: '#eb5321',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default ToggleButton;