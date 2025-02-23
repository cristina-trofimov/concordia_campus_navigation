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
    const translateX = useRef(new Animated.Value(initialCampus ? 0 : 80)).current;

    const toggleSwitch = () => {
        Animated.timing(translateX, {
            toValue: isSGW ? 80 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            const newIsSGW = !isSGW;
            setIsSGW(newIsSGW);
            onCampusChange(newIsSGW);
        });
    };

    return (
        <View >
            <TouchableOpacity style={styles.slider} onPress={toggleSwitch} activeOpacity={1}>
                <Animated.View style={[styles.knob, { transform: [{ translateX }] }]}>
                    <Text style={styles.label}>{isSGW ? 'SGW' : 'Loyola'}</Text>
                </Animated.View>
                <View style={styles.labelsContainer}>
                    <Text style={[styles.labelText, isSGW ? styles.activeLabel : styles.inactiveLabel]}>{isSGW ? '' : 'SGW'}</Text>
                    <Text style={[styles.labelText, !isSGW ? styles.activeLabel : styles.inactiveLabel]}>{!isSGW ? '' : 'Loyola'}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    slider: {
        margin: 10,
        width: 160,
        height: 40, // Height of the slider
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 20,
        justifyContent: 'center',
        paddingBottom: 0,
        paddingTop: 0,
        padding: 5, // Adjust padding to ensure the knob fits perfectly
        position: 'relative',
        overflow: 'hidden', // Ensure the knob doesn't overflow the slider
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    knob: {
        paddingBottom: 0,
        width: 90, // Width of the knob
        height: '100%', // Knob takes the full height of the slider
        backgroundColor: '#912338',
        borderRadius: 20, // Match the slider's borderRadius
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0, // Align to the top of the slider
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    labelText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    activeLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    inactiveLabel: {
        color: '#666',
    },
});

export default ToggleButton;