<<<<<<< HEAD
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button, ThemeProvider, createTheme } from '@rneui/themed';
import Map from './components/Map';
import BottomDrawer from './components/BottomDrawer';
=======
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, ThemeProvider, createTheme } from "@rneui/themed";
import Map from "./src/components/Map";
import BottomDrawer from "./src/components/BottomDrawer";

const { height, width } = Dimensions.get("window");
>>>>>>> master

const theme = createTheme({
  lightColors: {
    primary: "#B52B20",
    secondary: "#D15329",
  },

  mode: "light",
});

export default function App() {

  return (
<<<<<<< HEAD
    <SafeAreaProvider>
    <ThemeProvider theme={theme}>
      <View style={styles.container}>
        <Map />
          <BottomDrawer> hello</BottomDrawer>
      </View>
    </ThemeProvider>
  </SafeAreaProvider>
=======
    <View style={styles.container}>
      <Map />
      <BottomDrawer>hello</BottomDrawer>
    </View>
>>>>>>> master
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
