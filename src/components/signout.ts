import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const signOut = async () => {
    try {
        await GoogleSignin.signOut();
        console.log('User signed out successfully');
        // Update your app's state here (e.g., clear user data, navigate to login screen)
    } catch (error) {
        console.error('Error signing out:', error);
    }
};