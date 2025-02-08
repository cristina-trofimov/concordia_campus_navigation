import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

const ToggleButton = ({ mapRef, sgwCoords, loyolaCoords }) => {
    const [isSGW, setIsSGW] = useState(true);
    const translateX = useState(new Animated.Value(0))[0];

    const animateToRegion = (coords) => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.0100,
                longitudeDelta: 0.0100,
            }, 1000);
        }
    };

    const toggleSwitch = () => {
        Animated.timing(translateX, {
            toValue: isSGW ? 40 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            setIsSGW(!isSGW);
            animateToRegion(isSGW ? loyolaCoords : sgwCoords);
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.slider} onPress={toggleSwitch}>
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
        marginTop: 10,
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
        width: 40,
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