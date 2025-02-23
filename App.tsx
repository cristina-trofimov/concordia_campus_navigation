import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, ThemeProvider, createTheme } from "@rneui/themed";
import Map from "./src/components/Map";
import BottomDrawer from "./src/components/BottomDrawer";

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
    <ThemeProvider theme={theme}>
      <View style={styles.container}>
        <Map drawerHeight={drawerHeight} />
        <BottomDrawer drawerHeight={drawerHeight} children={undefined} />
      </View>
    </ThemeProvider>
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