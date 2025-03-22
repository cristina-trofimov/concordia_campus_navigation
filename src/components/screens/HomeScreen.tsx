import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, View } from "react-native";
import { createTheme } from "@rneui/themed";
import Map from "../Map";
import BottomDrawer from "../BottomDrawer";
import { CoordsProvider, useCoords } from "../../data/CoordsContext";
import LeftDrawer from "../LeftDrawer";
import CalendarButton from "../CalendarButton";
import { HomeStyle } from "../../styles/HomeStyle";
import SearchBars from "../SearchBars";
import DirectionsSteps from "../DirectionsSteps";
import { Text } from "react-native-elements";

const { height } = Dimensions.get("window");

const theme = createTheme({
  lightColors: {
    primary: '#912338',
    secondary: '#D15329',
  },

  mode: "light",
});

export default function HomeScreen() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;


  return (
    <CoordsProvider>
      <View style={HomeStyle.container}>
        <CalendarButton />
        <LeftDrawer />
        <Map drawerHeight={drawerHeight} />
        <BottomDrawer drawerHeight={drawerHeight} >
          <SearchBars />
          <DirectionsSteps/>
        </BottomDrawer>
      </View>
    </CoordsProvider>
  );
}
 