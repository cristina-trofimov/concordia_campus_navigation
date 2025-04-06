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
import { useClassEvents } from "../../data/ClassEventsContext";
import UpcomingClassItem from "../UpcomingClassItem";
import LeftDrawer from "../LeftDrawer";

const { height } = Dimensions.get("window");

export function HomeScreen() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;
  const [inputDestination, setInputDestination] = useState<string>("");
  const [inputOrigin, setInputOrigin] = useState<string>("");
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const { classEvents } = useClassEvents();

  const renderUpcomingClasses = () => {
    if (inputDestination === "" && classEvents.length > 0) {
      return classEvents.map((event, index) => (
        <UpcomingClassItem 
          calendarEvent={event} 
          key={index} 
          setInputDestination={setInputDestination} 
        />
      ));
    }
    return null;
  };

  return (
    <CoordsProvider>
      <IndoorsProvider>
        <View style={HomeStyle.container}>
          <CalendarButton />
          <PointOfInterestSelector
            pointsOfInterest={selectedPOI}
            radius={radius}
            onPOIChange={setSelectedPOI}
            onRadiusChange={setRadius}
          />
          {(globalThis as any).isTesting && <LeftDrawer />}
          <MapComponent
            drawerHeight={drawerHeight}
            setInputDestination={setInputDestination}
            setInputOrigin={setInputOrigin}
            selectedPOI={selectedPOI}
            radius={radius}
          />
          <FloorSelector />

          <BottomDrawer drawerHeight={drawerHeight}>
            <ScrollView>
              <SearchBars
                inputDestination={inputDestination}
                setInputDestination={setInputDestination}
                inputOrigin={inputOrigin}
                setInputOrigin={setInputOrigin}
              />
              {renderUpcomingClasses()}
              <RoomSearchBars />
              <DirectionsSteps />
            </ScrollView>
          </BottomDrawer>
        </View>
      </IndoorsProvider>
    </CoordsProvider>
  );
}

export default HomeScreen;

