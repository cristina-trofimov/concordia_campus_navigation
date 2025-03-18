// import statusCodes along with GoogleSignin
import {
    GoogleSignin,
    isErrorWithCode,
    statusCodes,
} from '@react-native-google-signin/google-signin';

// Somewhere in your code
export const signIn = async () => {
    try {
        // First check if user is already signed in
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
            // User is already signed in, we can get current user
            const currentUser = await GoogleSignin.getCurrentUser();
            console.log("Already signed in user:", JSON.stringify(currentUser, null, 2));
            return currentUser;
        }

        // Make sure Play Services are available
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        // Attempt sign in
        const userInfo = await GoogleSignin.signIn();
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