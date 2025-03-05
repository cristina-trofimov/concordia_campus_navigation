import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CalendarBody, CalendarContainer, CalendarHeader, } from "@howljs/calendar-kit";

const CalendarScreen = () => {
  // const handleGoingBack = () => {
  //   console.log('Button pressed!');
  //   // Add your button press logic here
  // };

  return (
    <View style={styles.container}>
      <CalendarContainer>
        <CalendarHeader />
        <CalendarBody />
      </CalendarContainer>
      <Text>This is the calendar screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CalendarScreen;
