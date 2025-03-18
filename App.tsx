import React from "react";
import { createTheme } from "@rneui/themed";
import HomeScreen from './src/components/screens/HomeScreen';
import CalendarScreen from "./src/components/screens/CalendarScreen";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';


GoogleSignin.configure({
  webClientId: '38724570048-54lor6uhetguagq3lp164ccfui1hq5h5.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  
});

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

  return (
    <GoogleSigninButton>
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
    </GoogleSigninButton>
      // <NavigationContainer>
      //   <Stack.Navigator initialRouteName="Home">
      //     <Stack.Screen name="Home" component={HomeScreen}
      //       options={{ headerShown: false }} // Hide the header for this screen only
      //     />
      //     <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      //   </Stack.Navigator>
      // </NavigationContainer>
  );
}

