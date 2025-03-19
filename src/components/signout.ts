import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const signOut = async () => {
    try {
        await GoogleSignin.signOut();
        console.log('User signed out successfully');
        
    } catch (error) {
        console.error('Error signing out:', error);
    }
};