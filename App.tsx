import React, { useState, useEffect  } from "react";
import { AppRegistry, AppState } from 'react-native';
import { createTheme } from "@rneui/themed";
import HomeScreen from './src/components/screens/HomeScreen';
import CalendarScreen from "./src/components/screens/CalendarScreen";
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import firebase from './src/components/firebase';
import analytics from '@react-native-firebase/analytics';
import { Calendar } from "./src/interfaces/calendar";
import { ClassEventsProvider } from "./src/data/ClassEventsContext";

const Stack = createNativeStackNavigator<RootStackParamList>();
(globalThis as any).isTesting = false; // when doing usability testing

export type RootStackParamList = {
  Home: undefined;
  Calendar: {
    accessToken?: string | null;
    calendars?: Calendar[];
    open: boolean;
  } | undefined;
};

export type CalendarScreenProp = RouteProp<RootStackParamList, "Calendar">;

export interface CalendarScreenProps { route: CalendarScreenProp; }

if (!(globalThis as any).userId) {
  (globalThis as any).userId = `user_${Date.now()}`;
}


const theme = createTheme({
  lightColors: {
    primary: '#912338',
    secondary: '#D15329',
  },
  mode: "light",
});

export default function App(): React.ReactElement {
useEffect(() => {
    analytics().resetAnalyticsData();  // Clears any stored data
  console.log("Generated User ID:", (globalThis as any).userId);
  console.log('Initializing Firebase...');
    analytics().setUserId((globalThis as any).userId);
  analytics().setAnalyticsCollectionEnabled(true);

  analytics().logAppOpen();

    if (globalThis.isTesting) {
      analytics().logEvent('testing_mode_enabled', {
        message: 'App is in testing mode.',
      });
      console.log('Custom Event Triggered: testing_mode_enabled');
    }
  }, []);

  return (
    <ClassEventsProvider >
      <NavigationContainer>

        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
        </Stack.Navigator>

      </NavigationContainer>
    </ClassEventsProvider>
  );
};

