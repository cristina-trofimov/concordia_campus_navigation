import React, { useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";
import { createTheme } from "@rneui/themed";
import HomeScreen from './src/components/screens/HomeScreen';
import CalendarScreen from "./src/components/screens/CalendarScreen";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const { height } = Dimensions.get("window");
const Stack = createNativeStackNavigator();

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

export default function App() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen}
            options={{ headerShown: false }} // Hide the header for this screen only
          />
          <Stack.Screen name="Calendar" component={CalendarScreen}
            options={{ headerShown: false }}
          // options={{
          //   headerTitle: () => <Text>Custom Title</Text>, // Custom title
          //   headerRight: () => (
          //     <Button
          //       title="Info"
          //       onPress={() => alert('Info button pressed!')} // Custom button
          //     />
          //   ),
          //   headerLeft: () => (
          //     <Button
          //       title="Back"
          //       onPress={() => navigation.goBack()} // Custom back button
          //     />
          //   ),
          // }}
        />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
});