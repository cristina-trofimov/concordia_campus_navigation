import React, { useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { createTheme } from "@rneui/themed";
import Map from "../Map";
import BottomDrawer from "../BottomDrawer";
import { CoordsProvider } from "../../data/CoordsContext";

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
      <View style={styles.container}>
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