import React from "react";
import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../App";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CalendarButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const goToCalendar = () => {
    // fetch from google calendar here??
    navigation.navigate("Calendar");
  };

  return (
    <View style={styles.calendarButtonContainer} >
      <TouchableOpacity style={styles.button} onPress={goToCalendar}>
      <FontAwesome name="calendar" size={26} color="white" style={styles.image} />
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 0,
    alignItems: 'center',
  },
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
    margin: 7,
  },
});

export default CalendarButton;
