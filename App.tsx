import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, ThemeProvider, createTheme } from "@rneui/themed";
import Map from "./src/components/Map";
import BottomDrawer from "./src/components/BottomDrawer";
import { CoordsProvider } from "./src/data/CoordsContext";
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from "./src/screens/CalendarScreen";
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

const { height } = Dimensions.get("window");
// const Stack = createNativeStackNavigator();

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
    // <CalendarScreen />
    <HomeScreen />
    // <GestureHandlerRootView style={{ flex: 1 }}>
    //   <NavigationContainer>
    //     <Stack.Navigator initialRouteName="Home">
    //       <Stack.Screen name="Home" component={HomeScreen} />
    //       <Stack.Screen name="Calendar" component={CalendarScreen} />
    //     </Stack.Navigator>
    //   </NavigationContainer>
    // // </GestureHandlerRootView>
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