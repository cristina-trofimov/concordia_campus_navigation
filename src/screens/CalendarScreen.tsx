import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import { CalendarBody, CalendarContainer, CalendarHeader } from '@howljs/calendar-kit';
// import CalendarButton from '../components/CalendarButton';

const CalendarScreen = () => {
    const handleGoingBack = () => {
      console.log('Button pressed!');
      // Add your button press logic here
    };
  
    return (
      <View >
        {/* <CalendarContainer>
          <CalendarHeader />
          <CalendarBody />
        </CalendarContainer> */}
        <View >
          <Text>This is the calendar screen FINALLY.</Text> 
        </View>
      </View>
    );
  };
  
  // const styles = StyleSheet.create({
  //   container: {
  //     flex: 1,
  //     backgroundColor: '#fff',
  //     padding: 20,
  //   },
  //   parentView: {
  //     height: 200, // Set a height for the parent View
  //     backgroundColor: '#f0f0f0', // Background color for visibility
  //     borderRadius: 10, // Rounded corners
  //     marginBottom: 20, // Spacing between views
  //     position: 'relative', // Required for absolute positioning of the button
  //   },
  //   content: {
  //     flex: 1,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //   },
  // });

export default CalendarScreen