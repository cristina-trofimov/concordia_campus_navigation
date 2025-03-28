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
import UpcomingClassItem from "../UpcomingClassItem";

const { height } = Dimensions.get("window");

export default function HomeScreen() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;

  const [inputDestination, setInputDestination] = useState<string>("");

  return (
    <CoordsProvider>
      <IndoorsProvider>
        <View style={HomeStyle.container}>
          <CalendarButton />
          <LeftDrawer />
          <MapComponent
            drawerHeight={drawerHeight}
            setInputDestination={setInputDestination}
          />
          <FloorSelector />

          <BottomDrawer drawerHeight={drawerHeight}>
            <SearchBars inputDestination={inputDestination} />
            <UpcomingClassItem
              courseName="SOEN 390"
              startTime="8:45 AM"
              endTime="10:00 AM"
              building="Hall Building"
              room="403"
              location="1455 Blvd. De Maisonneuve Ouest, Montreal, Quebec H3G 1M8"
            />
            <UpcomingClassItem
              courseName="SOEN 321"
              startTime="10:15 AM"
              endTime="11:30 AM"
              building="Faubourg Building (FG)"
              room="B055"
              location="1455 Rue Sainte-Catherine, Montreal, Quebec H3G 1M8"
            />
            <UpcomingClassItem
              courseName="COMP 445"
              startTime="2:45 PM"
              endTime="5:00 PM"
              building="JMSB Building"
              room="S2.225"
              location="1455 Rue Guy, Montreal, Quebec H3G 1M8"
            />
            <UpcomingClassItem
              courseName="ENGR 301"
              startTime="5:45 PM"
              endTime="20:15 PM"
              building="Hall Building"
              room="835"
              location="1455 Blvd. De Maisonneuve Ouest, Montreal, Quebec H3G 1M8"
            />
            <DirectionsSteps />
          </BottomDrawer>
        </View>
      </IndoorsProvider>
    </CoordsProvider>
  );
}
