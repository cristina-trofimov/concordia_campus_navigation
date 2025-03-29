import React from 'react'
import { useIndoor } from '../data/IndoorContext';
import { useCoords } from '../data/CoordsContext';
import { Text, TouchableOpacity, View } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { IndoorViewButtonStyle } from '../styles/IndoorViewButtonStyle';

function IndoorViewButton({ inFloorView }: { inFloorView: boolean }) {

    const { setInFloorView } = useIndoor();
    const { isInsideBuilding } = useCoords();
    const entypoBuildingColour = isInsideBuilding ? "#912338" : "grey"; 
    const borderColourInsideBuilding = isInsideBuilding ? "#912338" : "grey";
    const backgroundColorInsideBuilding = isInsideBuilding ? "white" : "#ddd";
    const opacityInsideBuilding = isInsideBuilding ? 1 : 0.5;


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
                onPress={() => setInFloorView(!inFloorView)}
            >
                <View style={IndoorViewButtonStyle.buttonContent}>
                    <Entypo name={inFloorView ? "tree" : "location"} size={20} color={inFloorView ? "#912338" : entypoBuildingColour} />
                    <Text style={[IndoorViewButtonStyle.buttonText, { color: "#912338" }]}>{inFloorView ? "Outside View" : "Floor View"}</Text>
                </View>
            </TouchableOpacity>

        </View>
    )
}

export default IndoorViewButton