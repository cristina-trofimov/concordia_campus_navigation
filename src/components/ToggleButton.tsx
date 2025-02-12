// ToggleButton.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';

interface ToggleButtonProps {
    mapRef: React.RefObject<Mapbox.MapView>;
    sgwCoords: { latitude: number; longitude: number };
    loyolaCoords: { latitude: number; longitude: number };
    onCampusChange: (isSGW: boolean) => void;
    initialCampus?: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ mapRef, sgwCoords, loyolaCoords, onCampusChange, initialCampus = true }) => {
    const [isSGW, setIsSGW] = useState(initialCampus);
    const translateX = useRef(new Animated.Value(initialCampus ? 0 : 40)).current;

    const toggleSwitch = () => {
        Animated.timing(translateX, {
            toValue: isSGW ? 40 : 0,
            duration: 300,
            useNativeDriver: true, //Allows for smoother scroll motionn
        }).start(() => {
            const newIsSGW = !isSGW;
            setIsSGW(newIsSGW);
            onCampusChange(newIsSGW);
        });
    };

    return (
        <View style={styles.container} testID="toggle-container">
            <TouchableOpacity style={styles.slider} onPress={toggleSwitch} activeOpacity={1} testID="toggle-button">
                <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} testID="knob">
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
        marginTop: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
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