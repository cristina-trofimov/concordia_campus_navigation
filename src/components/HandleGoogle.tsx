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

        const alreadySignedIn = await AsyncStorage.getItem("accessToken");
        if (alreadySignedIn) {
            console.log("User already signed in");
            return alreadySignedIn;
        }


        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const userInfo = await GoogleSignin.signIn();

        console.log("Sign-in successful. User Info:", JSON.stringify(userInfo, null, 2));

        const tokens = await GoogleSignin.getTokens();
        console.log("Sign-in successful. Access token obtained." + JSON.stringify(tokens.accessToken, null, 2));

        await AsyncStorage.setItem( 'accessToken', tokens.accessToken, );

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
        await AsyncStorage.removeItem("accessToken")
        await AsyncStorage.removeItem("chosenCalendar")
        console.log('User signed out successfully');        
    } catch (error) {
        console.error('Error signing out:', error);
    }
};
