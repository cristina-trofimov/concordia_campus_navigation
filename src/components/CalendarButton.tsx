import React from "react";
import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../App";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CalendarStyle } from "../styles/CalendarStyle";

const CalendarButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const goToCalendar = () => {
    // fetch from google calendar here??
    navigation.navigate("Calendar");
  };

  return (
    <View style={CalendarStyle.calendarButtonContainer} >
      <TouchableOpacity style={CalendarStyle.calBtn} onPress={goToCalendar}>
      <FontAwesome name="calendar" size={26} color="white" style={CalendarStyle.calButtonImg} />
    </TouchableOpacity>
    </View>
  );
};


export default CalendarButton;
