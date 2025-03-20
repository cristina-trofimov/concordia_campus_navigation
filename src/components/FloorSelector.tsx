import { Text } from "react-native-elements";
import { Touchable, TouchableOpacity, View } from "react-native";
import { FloorSelectorStyle } from "../styles/FloorSelectorStyle";
import { useCoords } from "../data/CoordsContext";

export const FloorSelector = () => {
    const { currentFloor } = useCoords();

    return (
        <View style={FloorSelectorStyle.floorSelectorContainer}>
            <TouchableOpacity>
                <Text>{currentFloor}</Text>
            </TouchableOpacity>
        </View>
    );
};