import React, { useState, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { ToggleButtonStyle } from '../styles/ToggleButtonStyle';

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
        <View style={ToggleButtonStyle.container}>
            <TouchableOpacity
                style={[
                    ToggleButtonStyle.slider,
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
                        ToggleButtonStyle.knob,
                        {
                            width: knobWidth,
                            height: toggleHeight,
                            borderRadius: toggleHeight / 2,
                            transform: [{ translateX }]
                        }
                    ]}
                />

                <View style={ToggleButtonStyle.labelsContainer}>
                    <View style={ToggleButtonStyle.labelContainer}>
                        <Text style={[
                            ToggleButtonStyle.labelText,
                            !isSGW ? ToggleButtonStyle.activeLabel : ToggleButtonStyle.inactiveLabel,
                            { fontSize: Math.max(14, toggleHeight * 0.38) }
                        ]}>
                            Loyola
                        </Text>
                    </View>

                    <View style={ToggleButtonStyle.labelContainer}>
                        <Text style={[
                            ToggleButtonStyle.labelText,
                            isSGW ? ToggleButtonStyle.activeLabel : ToggleButtonStyle.inactiveLabel,
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



export default ToggleButton;