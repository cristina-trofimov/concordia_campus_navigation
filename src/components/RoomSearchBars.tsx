import { Text, TouchableOpacity, View } from "react-native";
import { RoomSearchBar } from "./RoomSearchBar";
import { useCoords } from "../data/CoordsContext";
import { useIndoor } from "../data/IndoorContext";
import { getIndoorDirectionText } from "./IndoorInstruction";
import { useState } from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export const RoomSearchBars = () => {
  const { originCoords, destinationCoords, myLocationCoords } = useCoords();
  const { originRoom, destinationRoom } = useIndoor()

  const [selectedTransport, setSelectedTransport] = useState("escalator");

  const transportModes: { mode: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string}[] = [
    { mode: "escalator", icon: "escalator", label: "Escalator" },
    { mode: "elevator", icon: "elevator-passenger-outline", label: "Elevator" },
    { mode: "stairs", icon: "stairs", label: "Stairs" },
  ];

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
            location={originCoords ? originCoords : myLocationCoords}
            placeholder="origin room"
            searchType={"origin"}
          />
          <RoomSearchBar
            location={destinationCoords}
            placeholder="destination room"
            searchType={"destination"}
          />
        </View>
      )}
      {originRoom && destinationRoom && (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingHorizontal: 10,
              marginBottom: 10,
              gap: 15,
            }}
          >
            {transportModes.map((transport) => (
              <TouchableOpacity
                key={transport.mode}
                onPress={() => setSelectedTransport(transport.mode)}
              >
                <MaterialCommunityIcons
                  name={transport.icon}
                  size={24}
                  color={selectedTransport === transport.mode ? '#912338' : '#555'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
            paddingHorizontal: 10,
            marginBottom: 5,
          }}>
            {getIndoorDirectionText(originRoom.floor, destinationRoom.floor, selectedTransport)}
          </Text>
        </>
      )}
    </>
  );
};

export default RoomSearchBars;