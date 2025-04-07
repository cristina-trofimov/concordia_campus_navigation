import {
    GoogleSignin,
    isErrorWithCode,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { WEBCLIENTID } from '@env'
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        strict: false, // Disables strict mode
    });
}

export const signIn = async () => {
    try {

        configureGooggleSignIn();

        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
            return token;
        }


        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        await GoogleSignin.signIn();

        const tokens = await GoogleSignin.getTokens();

        await AsyncStorage.setItem( 'accessToken', tokens.accessToken, );

        return tokens.accessToken;


    } catch (error) {
        console.error("Sign-in error full details:", error);

        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    console.error('User cancelled the sign-in flow');
                    break;
                case statusCodes.IN_PROGRESS:
                    console.error('Sign-in operation is in progress already');
                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    console.error('Play services not available or outdated');
                    break;
                default:
                    console.error(`Other error. Code: ${error.code}, Message: ${error.message}`);
            }
        } else {
            console.error('Non-status code error:', error);
        }
        return null;
    }
};

export const signOut = async () => {
    try {
        await GoogleSignin.signOut();
        await AsyncStorage.removeItem("accessToken")
        await AsyncStorage.removeItem("chosenCalendar")   
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
