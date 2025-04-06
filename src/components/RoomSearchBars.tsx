import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCoords } from "../data/CoordsContext";
import RoomSearchBar from "./RoomSearchBar";
import { useIndoor } from "../data/IndoorContext";
import { useEffect, useState } from "react";

export const RoomSearchBars = () => {
  const { originCoords, destinationCoords, myLocationCoords } = useCoords();
  const { setIndoorTransport } = useIndoor();
  const [selectedTransport, setSelectedTransport] = useState<string>("");
  const [roomSearched, setRoomSearched] = useState<boolean>(false);
  const [originRoomSearched, setOriginRoomSearched] = useState<boolean>(false);
  const [destinationRoomSearched, setDestinationRoomSearched] = useState<boolean>(false);

  const handleIconPress = (iconName: string) => {
    setIndoorTransport(iconName);  // Set the indoor transport type to the clicked icon name
    setSelectedTransport(iconName);  // Update the selected transport icon
  };

  const getIconColor = (iconName: string) => {
    return selectedTransport === iconName ? "#912338" : "black";  // Change the color when selected
  };

  useEffect(() => {
    setRoomSearched(originRoomSearched || destinationRoomSearched);
  }, [originRoomSearched, destinationRoomSearched]);

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
            location={originCoords ?? myLocationCoords}
            placeholder="origin room"
            searchType={"origin"}
            setRoomSearched={setOriginRoomSearched}
          />
          <RoomSearchBar
            location={destinationCoords}
            placeholder="destination room"
            searchType={"destination"}
            setRoomSearched={setDestinationRoomSearched}
          />
        </View>
      )}

      {/* Add the icons row */}
      {destinationCoords && roomSearched && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
          marginVertical: 10,
        }}>
          <TouchableOpacity onPress={() =>{
              if ((globalThis as any).isTesting && (globalThis as any).taskTimer.isStarted()) {
              analytics().logEvent('Task_4_wrong_mode', {
              type: "escalator",
              user_id: (globalThis as any).userId,
              });}
               handleIconPress("stairs")}}>
            <MaterialIcons name="stairs" size={30} color={getIconColor("stairs")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
          if ((globalThis as any).isTesting && (globalThis as any).taskTimer.isStarted()) {
                 analytics().logEvent('Task_4_wrong_mode', {
                 type: "escalator",
                 user_id: (globalThis as any).userId,
                 });}
                 handleIconPress("elevator")}}>
            <MaterialIcons name="elevator" size={30} color={getIconColor("elevator")} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            if ((globalThis as any).isTesting && (globalThis as any).taskTimer.isStarted()) {
                const elapsedTime = (globalThis as any).taskTimer.stop();
                analytics().logEvent('Task_4_finished', {
                   elapsed_time: elapsedTime/1000,
                   user_id: (globalThis as any).userId,
                                           });}
              handleIconPress("escalator")}}>


            <MaterialIcons name="escalator" size={30} color={getIconColor("escalator")} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default RoomSearchBars;
