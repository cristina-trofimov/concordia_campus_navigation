import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';


const ToggleButton = ({mapRef,sgwCoords,loyolaCoords}) => {
    const [stateOn, setState] = useState(false);

    const setToSGW = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: sgwCoords.latitude,
                longitude: sgwCoords.longitude,
                latitudeDelta: 0.0100,
                longitudeDelta: 0.0100,
            }, 1000);
        }
    }

    const setToLoyola = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: loyolaCoords.latitude,
                longitude: loyolaCoords.longitude,
                latitudeDelta: 0.0100,
                longitudeDelta: 0.0100,
            }, 1000);
        }
    }

    const ToggleState = () => {
        if (stateOn) {
            setToSGW();
        } else {
            setToLoyola();
        }
        setState(!stateOn);
    }

    return (
        <View>
            <TouchableOpacity onPress={ToggleState}>
                <Text>
                    {stateOn ? 'SGW' : 'Loyola'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default ToggleButton;





