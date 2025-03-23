import firebase from '@react-native-firebase/app';
import '@react-native-firebase/analytics';
import '@react-native-firebase/crashlytics';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp({
    // It will use the config from google-services.json by default
  });
}

export default firebase;