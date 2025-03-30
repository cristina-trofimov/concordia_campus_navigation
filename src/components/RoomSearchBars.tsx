import { View } from "react-native";
import { RoomSearchBar } from "./RoomSearchBar";
import { useCoords } from "../data/CoordsContext";

export const RoomSearchBars = () => {
  const { originCoords, destinationCoords } = useCoords();

    return (
        <>
        {destinationCoords && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingHorizontal: 10,
              marginVertical: 5,
              gap: 15,
            }}>
              <RoomSearchBar
                location={originCoords}
                placeholder="origin room"
              />
              <RoomSearchBar
                location={destinationCoords}
                placeholder="destination room"
              />
            </View>
          )}
        </>
    )

};

export default RoomSearchBars;