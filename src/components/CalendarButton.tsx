import React, { useState } from "react";
import { TouchableOpacity, View, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../App";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CalendarStyle } from "../styles/CalendarStyle";
import { signIn } from "./HandleGoogle";
import { fetchUserCalendars } from "./googleCalendarFetching";
import { Calendar } from "../interfaces/calendar";

const CalendarButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [calendars, setCalendars] = useState<Calendar[] | undefined>([]);

  const goToCalendar = async () => {
    const token = await signIn();
    if (token) {
        const calendars = await fetchUserCalendars(token);
        if (calendars) {
            setCalendars(calendars.data?.calendars);
        }
        console.log(calendars.data?.calendars);
        navigation.navigate("Calendar", {calendars: calendars});
    };
}

  return (
    <View style={CalendarStyle.calendarButtonContainer} >
      <TouchableOpacity style={CalendarStyle.calBtn} onPress={goToCalendar}>
      <FontAwesome name="calendar" size={26} color="white" style={CalendarStyle.calButtonImg} />
    </TouchableOpacity>
    </View>
  );
};


export default CalendarButton;
