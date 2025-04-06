import React from 'react'
import { useIndoor } from '../data/IndoorContext';
import { Text, TouchableOpacity, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { IndoorViewButtonStyle } from '../styles/IndoorViewButtonStyle';
import { changeCurrentFloorAssociations } from './IndoorMap';

function IndoorViewButton({ inFloorView, buildingId, onClose }: { inFloorView: boolean, buildingId: string, onClose: () => void; }) {

    const { setInFloorView, setCurrentFloorAssociations } = useIndoor();
    const buildingFloorAssociations = changeCurrentFloorAssociations(buildingId);
    const entypoBuildingColour = buildingFloorAssociations.length > 0 ? "#912338" : "grey"; 
    const borderColourInsideBuilding = buildingFloorAssociations.length > 0  ? "#912338" : "grey";
    const backgroundColorInsideBuilding = buildingFloorAssociations.length > 0  ? "white" : "#ddd";
    const opacityInsideBuilding = buildingFloorAssociations.length > 0  ? 1 : 0.5;

    // Handler function that only executes if buildingFloorAssociations exists
    const handlePress = () => {
        console.log("buildingFloorAssociations length:", buildingFloorAssociations.length);
        if (buildingFloorAssociations) {
            setInFloorView(!inFloorView);
            setCurrentFloorAssociations(buildingFloorAssociations);
            onClose();
        }
    };

    return (
        <View>
            <TouchableOpacity
                style={[
                    IndoorViewButtonStyle.button,
                    {
                        backgroundColor: inFloorView ? "white" : backgroundColorInsideBuilding,
                        borderColor: inFloorView ? "#912338" : borderColourInsideBuilding,
                        opacity: inFloorView ? 1 : opacityInsideBuilding
                    }
                ]}
                onPress={handlePress}
                disabled={buildingFloorAssociations.length < 1 }
            >
                <View style={IndoorViewButtonStyle.buttonContent}>
                    <Entypo name={inFloorView ? "tree" : "location"} size={20} color={inFloorView ? "#912338" : entypoBuildingColour} />
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default IndoorViewButton;