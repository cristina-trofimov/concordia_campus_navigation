import {
    GoogleSignin,
    isErrorWithCode,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WEBCLIENTID } from '@env'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';


export const configureGooggleSignIn = () => {
    GoogleSignin.configure({
        webClientId: WEBCLIENTID, // You need to fill this in with your actual web client ID
        scopes: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
        offlineAccess: true,
        forceCodeForRefreshToken: false,
    });
    configureReanimatedLogger({
        level: ReanimatedLogLevel.warn,
        strict: true, // Disables strict mode
    });
}

export const signIn = async () => {
    try {

        configureGooggleSignIn();

        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
            console.log("Already signed in user:", JSON.stringify(currentUser, null, 2));

            const tokens = await GoogleSignin.getTokens();
            return tokens.accessToken;
        }


        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const userInfo = await GoogleSignin.signIn();

        console.log("Sign-in successful. User Info:", JSON.stringify(userInfo, null, 2));

        const tokens = await GoogleSignin.getTokens();
        console.log("Sign-in successful. Access token obtained." + JSON.stringify(tokens.accessToken, null, 2));

        // await AsyncStorage.setItem('userInfo', tokens.accessToken);

        return tokens.accessToken;


    } catch (error) {
        console.error("Sign-in error full details:", error);

        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    console.log('User cancelled the sign-in flow');
                    break;
                case statusCodes.IN_PROGRESS:
                    console.log('Sign-in operation is in progress already');
                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    console.log('Play services not available or outdated');
                    break;
                default:
                    console.log(`Other error. Code: ${error.code}, Message: ${error.message}`);
            }
        } else {
            console.log('Non-status code error:', error);
        }
        return null;
    }
};

export const signOut = async () => {
    try {
        await GoogleSignin.signOut();
        console.log('User signed out successfully');

        await AsyncStorage.removeItem('userInfo');
        
    } catch (error) {
        console.error('Error signing out:', error);
    }
};

export const getUserInfo = async () => {
    try {
    return await AsyncStorage.getItem('userInfo');
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  };