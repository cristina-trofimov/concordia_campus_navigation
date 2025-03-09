import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, ThemeProvider, createTheme } from "@rneui/themed";
import Map from "./src/components/Map";
import BottomDrawer from "./src/components/BottomDrawer";
import { CoordsProvider } from "./src/data/CoordsContext";
import ShuttleBusTracker from "./src/data/ShuttleBusTracker";

const { height } = Dimensions.get("window");

const theme = createTheme({
  lightColors: {
    primary: '#912338',
    secondary: '#D15329',
  },

  mode: "light",
});

export default function App() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;

  return (
    <CoordsProvider>
      <View style={styles.container}>
        <Map drawerHeight={drawerHeight} />
        <ShuttleBusTracker />
        <BottomDrawer drawerHeight={drawerHeight} children={undefined} />
      </View>
    </CoordsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
});