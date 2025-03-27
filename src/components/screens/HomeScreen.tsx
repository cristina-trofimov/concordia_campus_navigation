import React, { useRef, useState } from "react";
import { Animated, Dimensions, View } from "react-native";
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
import PointOfInterestSelector from "../Point-of-interest_Form";

const { height } = Dimensions.get("window");


export default function HomeScreen() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;

  const { routeData: routeCoordinates, isTransit } = useCoords();
  const [htmlInstructions, setHtmlInstructions] = useState<string[]>([]);
  const [inputDestination, setInputDestination] = useState<string>("");
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [radius, setRadius] = useState<number | null>(null);


  return (
    <CoordsProvider>
      <IndoorsProvider>
        <View style={HomeStyle.container}>
          <CalendarButton />
          <LeftDrawer />
          <MapComponent drawerHeight={drawerHeight} setInputDestination={setInputDestination} selectedPOI={selectedPOI} radius={radius} />
          <FloorSelector />

          <BottomDrawer drawerHeight={drawerHeight} >
            <SearchBars inputDestination={inputDestination} />
            <PointOfInterestSelector
                         pointsOfInterest={selectedPOI}
                         radius={radius}
                         onPOIChange={setSelectedPOI}
                         onRadiusChange={setRadius}
                       />
            <DirectionsSteps/>
          </BottomDrawer>

        </View>
      </IndoorsProvider>
    </CoordsProvider>
  );
}
