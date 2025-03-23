import React, { useState, useEffect  } from "react";
import { AppRegistry } from 'react-native';
import { createTheme } from "@rneui/themed";
import HomeScreen from './src/components/screens/HomeScreen';
import CalendarScreen from "./src/components/screens/CalendarScreen";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import firebase from './src/components/firebase';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

const Stack = createNativeStackNavigator();
(globalThis as any).isTesting = false; // when doing usability testing
export type RootStackParamList = {
  Home: undefined;
  Calendar: undefined;
};

const theme = createTheme({
  lightColors: {
    primary: '#912338',
    secondary: '#D15329',
  },
  mode: "light",
});

export default function App(): React.ReactElement {
useEffect(() => {
  console.log('Initializing Firebase...');
  analytics().setAnalyticsCollectionEnabled(true);
  crashlytics().setCrashlyticsCollectionEnabled(true);
  analytics().logAppOpen();

 if (globalThis.isTesting) {
    analytics().logEvent('testing_mode_enabled', {
      message: 'App is in testing mode.',
    });
    console.log('Custom Event Triggered: testing_mode_enabled');
  }
}, []);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
};

export default App;
