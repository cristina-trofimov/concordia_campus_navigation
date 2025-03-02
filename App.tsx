import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    // <HomeScreen />
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;




// import React, { useEffect, useRef, useState } from "react";
// import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { Button, ThemeProvider, createTheme } from "@rneui/themed";
// import Map from "./src/components/Map";
// import BottomDrawer from "./src/components/BottomDrawer";
// import { CoordsProvider } from "./src/data/CoordsContext";

// const { height } = Dimensions.get("window");

// const theme = createTheme({
//   lightColors: {
//     primary: '#912338',
//     secondary: '#D15329',
//   },

//   mode: "light",
// });

// export default function App() {
//   const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;

//   return (
//     <CoordsProvider>
//       <View style={styles.container}>
//         <Map drawerHeight={drawerHeight} />
//         <BottomDrawer drawerHeight={drawerHeight} children={undefined} />
//       </View>
//     </CoordsProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
// });