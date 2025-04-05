import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCoords } from "../data/CoordsContext";
import RoomSearchBar from "./RoomSearchBar";
import { useIndoor } from "../data/IndoorContext";
import { useState } from "react";

export const RoomSearchBars = () => {
  const { originCoords, destinationCoords, myLocationCoords } = useCoords();
  const { setIndoorTransport } = useIndoor();
  const [selectedTransport, setSelectedTransport] = useState<string>("");

  const handleIconPress = (iconName: string) => {
    setIndoorTransport(iconName);  // Set the indoor transport type to the clicked icon name
    setSelectedTransport(iconName);  // Update the selected transport icon
  };

  const getIconColor = (iconName: string) => {
    return selectedTransport === iconName ? "#912338" : "black";  // Change the color when selected
  };

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

      {/* Add the icons row */}
      {destinationCoords && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
          marginVertical: 10,
        }}>
          <TouchableOpacity onPress={() => handleIconPress("stairs")}>
            <MaterialIcons name="stairs" size={30} color={getIconColor("stairs")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleIconPress("elevator")}>
            <MaterialIcons name="elevator" size={30} color={getIconColor("elevator")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleIconPress("escalator")}>
            <MaterialIcons name="escalator" size={30} color={getIconColor("escalator")} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default RoomSearchBars;
