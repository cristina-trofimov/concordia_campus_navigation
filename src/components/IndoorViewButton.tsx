import React from 'react'
import { useIndoor } from '../data/IndoorContext';
import { useCoords } from '../data/CoordsContext';
import { Text, TouchableOpacity, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { IndoorViewButtonStyle } from '../styles/IndoorViewButtonStyle';
import { changeCurrentFloorAssociations } from './IndoorMap';

function IndoorViewButton({ inFloorView, buildingId, onClose }: { inFloorView: boolean, buildingId: string, onClose: () => void; }) {

    const { setInFloorView, setCurrentFloorAssociations } = useIndoor();
    const buildingFloorAssociations = changeCurrentFloorAssociations(buildingId);
    const entypoBuildingColour = buildingFloorAssociations ? "#912338" : "grey"; 
    const borderColourInsideBuilding = buildingFloorAssociations ? "#912338" : "grey";
    const backgroundColorInsideBuilding = buildingFloorAssociations ? "white" : "#ddd";
    const opacityInsideBuilding = buildingFloorAssociations ? 1 : 0.5;


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
                onPress={() => {
                    setInFloorView(!inFloorView);
                    setCurrentFloorAssociations(buildingFloorAssociations);
                    onClose();
                }}
            >
                <View style={IndoorViewButtonStyle.buttonContent}>
                    <Entypo name={inFloorView ? "tree" : "location"} size={20} color={inFloorView ? "#912338" : entypoBuildingColour} />
                </View>
            </TouchableOpacity>

        </View>
    )
}

export default IndoorViewButton