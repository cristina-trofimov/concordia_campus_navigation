import React, { useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, View } from "react-native";
import BottomDrawer from "../BottomDrawer";
import { CoordsProvider } from "../../data/CoordsContext";
import { IndoorsProvider } from "../../data/IndoorContext";
import LeftDrawer from "../LeftDrawer";
import CalendarButton from "../CalendarButton";
import { HomeStyle } from "../../styles/HomeStyle";
import { FloorSelector } from "../FloorSelector";
import SearchBars from "../SearchBars";
import DirectionsSteps from "../DirectionsSteps";
import MapComponent from "../MapComponent";
import { RoomSearchBars } from "../RoomSearchBars"


const { height } = Dimensions.get("window");


export default function HomeScreen() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;

  const [inputDestination, setInputDestination] = useState<string>("");
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  return (
    <CoordsProvider>
      <IndoorsProvider>
        <View style={HomeStyle.container}>
          <CalendarButton />
          <LeftDrawer />
          <MapComponent drawerHeight={drawerHeight} setInputDestination={setInputDestination} destinationCoords={destinationCoords}/>
          <FloorSelector />

          <BottomDrawer drawerHeight={drawerHeight} >
            <ScrollView>
              <SearchBars
                inputDestination={inputDestination}
                originCoords={originCoords}
                setOriginCoords={setOriginCoords}
                destinationCoords={destinationCoords}
                setDestinationCoords={setDestinationCoords}
              />
              <RoomSearchBars originCoords={originCoords} destinationCoords={destinationCoords} />
              <DirectionsSteps />
            </ScrollView>
          </BottomDrawer>

        </View>
      </IndoorsProvider>
    </CoordsProvider>
  );
}
