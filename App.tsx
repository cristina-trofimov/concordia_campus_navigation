import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, ThemeProvider, createTheme } from "@rneui/themed";
import Map from "./src/components/Map";
import BottomDrawer from "./src/components/BottomDrawer";
import { CoordsProvider } from "./src/data/CoordsContext";
import analytics from '@react-native-firebase/analytics';

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

const handleLoginPress = async () => {
    await analytics().logEvent('login_button_pressed', {
      user_status: 'test_user'
    });
    console.log("Login button event logged");
  };
  return (
    <CoordsProvider>
      <View style={styles.container}>
       <Button title="Login" onPress={handleLoginPress} />
        <Map drawerHeight={drawerHeight} />
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