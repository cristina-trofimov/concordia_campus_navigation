import React from "react";
import { TouchableOpacity, View, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../../App";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CalendarStyle } from "../styles/CalendarStyle";
import { signIn } from "./HandleGoogle";
import { fetchUserCalendars } from "./googleCalendarFetching.ts";
import analytics from '@react-native-firebase/analytics';
const CalendarButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const goToCalendar = async () => {
      logNavigationEvent(); //for firebase
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
const logNavigationEvent = async () => {

       try {
           if ((globalThis as any).isTesting && (globalThis as any).taskTimer.isStarted()) {
                              await analytics().logEvent('Calendar_Button', {
                                  user_id: (globalThis as any).userId,
                              });
                          console.log(`Custom Event Logged: calendar button clicked`);
           }

       } catch (error) {
           console.error("Error logging Firebase event:", error);
       }
   };
  return (
    <View testID="calendar-button" style={CalendarStyle.calendarButtonContainer} >
      <TouchableOpacity style={CalendarStyle.calBtn} onPress={goToCalendar}>
        <FontAwesome testID="calendar-icon" name="calendar" size={26} color="white" style={CalendarStyle.calButtonImg} />
      </TouchableOpacity>
    </View>
  );
};


export default CalendarButton;
