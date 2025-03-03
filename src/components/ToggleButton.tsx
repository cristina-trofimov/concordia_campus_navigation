import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import Mapbox from '@rnmapbox/maps';

interface ToggleButtonProps {
    mapRef: React.RefObject<Mapbox.MapView>;
    sgwCoords: { latitude: number; longitude: number };
    loyolaCoords: { latitude: number; longitude: number };
    onCampusChange: (isSGW: boolean) => void;
    initialCampus?: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ 
    mapRef, 
    sgwCoords, 
    loyolaCoords, 
    onCampusChange, 
    initialCampus = true // false = Loyola, true = SGW
}) => {

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    
    const toggleWidth = Math.min(200, screenWidth * 0.50);
    const toggleHeight = Math.min(40, screenHeight * 0.05);
    const knobWidth = toggleWidth / 2;
    
    const [isSGW, setIsSGW] = useState(initialCampus);
    const translateX = useRef(new Animated.Value(initialCampus ? knobWidth : 0)).current;

    const toggleSwitch = () => {
        const newIsSGW = !isSGW;
        setIsSGW(newIsSGW);
        
        Animated.timing(translateX, {
            toValue: newIsSGW ? knobWidth : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
        
        onCampusChange(newIsSGW);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[
                    styles.slider,
                    {
                        width: toggleWidth,
                        height: toggleHeight,
                        borderRadius: toggleHeight / 2,
                    }
                ]}
                onPress={toggleSwitch}
                activeOpacity={0.9}
            >
                <Animated.View 
                    style={[
                        styles.knob, 
                        {
                            width: knobWidth,
                            height: toggleHeight,
                            borderRadius: toggleHeight / 2,
                            transform: [{ translateX }]
                        }
                    ]}
                />
                
                <View style={styles.labelsContainer}>
                    <View style={styles.labelContainer}>
                        <Text style={[
                            styles.labelText, 
                            !isSGW ? styles.activeLabel : styles.inactiveLabel,
                            { fontSize: Math.max(14, toggleHeight * 0.38) }
                        ]}>
                            Loyola
                        </Text>
                    </View>
                    
                    <View style={styles.labelContainer}>
                        <Text style={[
                            styles.labelText, 
                            isSGW ? styles.activeLabel : styles.inactiveLabel,
                            { fontSize: Math.max(14, toggleHeight * 0.38) }
                        ]}>
                            SGW
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    slider: {
        backgroundColor: 'white',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 10,
    },
    knob: {
        backgroundColor: '#8D1919',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    labelsContainer: {
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 1,
    },
    labelContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelText: {
        fontWeight: 'bold',
    },
    activeLabel: {
        color: 'white',
    },
    inactiveLabel: {
        color: 'black',
    },
});

export default ToggleButton;