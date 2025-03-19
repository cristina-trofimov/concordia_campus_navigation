import {
    GoogleSignin,
    isErrorWithCode,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const signIn = async () => {
    try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
            
            const currentUser = await GoogleSignin.getCurrentUser();
            console.log("Already signed in user:", JSON.stringify(currentUser, null, 2));
            return currentUser;
        }

        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        const userInfo = await GoogleSignin.signIn();
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log("Sign-in successful. User Info:", JSON.stringify(userInfo, null, 2));

        return userInfo;
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
        await AsyncStorage.removeItem('userInfo');
        console.log('User signed out successfully');
        
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