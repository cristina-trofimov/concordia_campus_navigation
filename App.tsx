import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, ThemeProvider, createTheme } from "@rneui/themed";
import Map from "./src/components/Map";
import BottomDrawer from "./src/components/BottomDrawer";

const { height, width } = Dimensions.get("window");

const theme = createTheme({
  lightColors: {
    primary: '#912338',
    secondary: '#D15329',
  },

  mode: "light",
});

export default function App() {

  return (
    <View style={styles.container}>
      <Map />
      <BottomDrawer>
      <Text id="maestro-test-text">
      TEST Maestro!
      </Text>
      </BottomDrawer>
    </View>
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
