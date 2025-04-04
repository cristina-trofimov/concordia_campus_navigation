import React from "react";
import { TouchableOpacity, View, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../App";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CalendarStyle } from "../styles/CalendarStyle";
import { signIn } from "./HandleGoogle";
import { fetchUserCalendars } from "./googleCalendarFetching.ts";

const CalendarButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const goToCalendar = async () => {
    const token = await signIn();
    if (token) {
      const calendars = await fetchUserCalendars(token);
      if (calendars?.data?.calendars) {
        const calendarsData = calendars.data.calendars;
        navigation.navigate("Calendar", { accessToken: token, calendars: calendarsData, open : true });
      }
    }
    // navigation.navigate("Calendar", { accessToken: token });

  }

  return (
    <View testID="calendar-button" style={CalendarStyle.calendarButtonContainer} >
      <TouchableOpacity style={CalendarStyle.calBtn} onPress={goToCalendar}>
        <FontAwesome testID="calendar-icon" name="calendar" size={26} color="white" style={CalendarStyle.calButtonImg} />
      </TouchableOpacity>
    </View>
  );
};


export default CalendarButton;
