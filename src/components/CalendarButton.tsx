import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const CalendarButton = () => {
  const navigation = useNavigation();

  const goToCalendar = () => {
    navigation.navigate("Calendar");
  };

  return (
    <TouchableOpacity style={styles.button} onPress={goToCalendar}>
      <Image
        source={require("../../src/resources/images/icons8-calendar-icon.png")}
        style={styles.image}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 10,
    right: 10,
    height: 40,
    width: 40,
    backgroundColor: "#912338",
    borderRadius: 5,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    zIndex: 1,
  },
  image: {
    margin: 5,
    height: 30,
    width: 30,
  },
});

export default CalendarButton;
