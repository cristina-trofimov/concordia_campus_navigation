import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, ThemeProvider, createTheme } from "@rneui/themed";
import Map from "./src/components/Map";
import SearchBarMenu from "./src/components/SearchBarMenu";

const { height, width } = Dimensions.get("window");

const theme = createTheme({
  lightColors: {
    primary: "#B52B20",
    secondary: "#D15329",
  },

  mode: "light",
});

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://10.0.2.2:3000")
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <View style={styles.container}>
      <Map />
      <SearchBarMenu />
      {/* this was messing with the position of the searchBarMenu so commented it out idk if we still need this */}
      {/* <Text>{message}</Text>  */}
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
