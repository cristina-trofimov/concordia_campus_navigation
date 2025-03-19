import React, { useRef } from "react";
import { Animated, Dimensions, View } from "react-native";
import { createTheme } from "@rneui/themed";
import Map from "../Map";
import BottomDrawer from "../BottomDrawer";
import { CoordsProvider } from "../../data/CoordsContext";
import LeftDrawer from "../LeftDrawer";
import CalendarButton from "../CalendarButton";
import { HomeStyle } from "../../styles/HomeStyle";

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
        <BottomDrawer drawerHeight={drawerHeight} children={undefined} />
      </View>
    </CoordsProvider>
  );
}
