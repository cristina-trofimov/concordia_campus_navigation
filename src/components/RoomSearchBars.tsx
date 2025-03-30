import { View } from "react-native";
import { RoomSearchBar } from "./RoomSearchBar";

export function RoomSearchBars({ 
    originCoords, 
    destinationCoords, 
}: { 
    originCoords: any;
    destinationCoords: any;
}) {

    return (
        <>
        {destinationCoords && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              marginVertical: 5,
            }}>
              <View>
                <RoomSearchBar
                  location={originCoords}
                  placeholder="origin room"
                />
              </View>
              <View>
                <RoomSearchBar
                  location={destinationCoords}
                  placeholder="destination room"
                />
              </View>
            </View>
          )}
        </>
    )

};

export default RoomSearchBars;