import React, { useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, View } from "react-native";
import BottomDrawer from "../BottomDrawer";
import { CoordsProvider } from "../../data/CoordsContext";
import { IndoorsProvider } from "../../data/IndoorContext";
import CalendarButton from "../CalendarButton";
import { HomeStyle } from "../../styles/HomeStyle";
import { FloorSelector } from "../FloorSelector";
import SearchBars from "../SearchBars";
import DirectionsSteps from "../DirectionsSteps";
import MapComponent from "../MapComponent";
import PointOfInterestSelector from "../Point-of-interest_Form";
import { RoomSearchBars } from "../RoomSearchBars";
import UpcomingClassItem from "../UpcomingClassItem";
import { CalendarEvent } from "../../interfaces/CalendraEvent";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;
  const [inputDestination, setInputDestination] = useState<string>("");
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [radius, setRadius] = useState<number | null>(null);

  return (
    <CoordsProvider>
      <IndoorsProvider>
        <View style={HomeStyle.container}>
          <CalendarButton />
          <MapComponent
            drawerHeight={drawerHeight}
            setInputDestination={setInputDestination}
            selectedPOI={selectedPOI}
            radius={radius}
          />
          <FloorSelector />

          <BottomDrawer drawerHeight={drawerHeight}>
            <ScrollView>
              <SearchBars inputDestination={inputDestination} />
              <RoomSearchBars />
              <PointOfInterestSelector
                pointsOfInterest={selectedPOI}
                radius={radius}
                onPOIChange={setSelectedPOI}
                onRadiusChange={setRadius}
              />
              <DirectionsSteps />
            </ScrollView>
          </BottomDrawer>
        </View>
      </IndoorsProvider>
    </CoordsProvider>
  );
}
