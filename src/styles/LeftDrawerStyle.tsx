import { StyleSheet } from 'react-native';

export const LeftDrawerStyle = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 20,
      left: 0,
      alignItems: 'center',
    },
    button: {
      position: "absolute",
      top: 10,
      left: 10,
      height: 40,
      width: 40,
      backgroundColor: "rgba(255, 255, 255, 1)",
      borderRadius: 5,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      zIndex: 1,
    },
    image: {
      margin: 5,
      height: 30,
      width: 30,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    drawer: {
      width: "70%",
      height: "100%",
      backgroundColor: "white",
      padding: 20,
    },
    contentContainer: {
      flexDirection: 'column',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 20,
      padding: 10,
      marginTop: 20,
    },
    contentImage: {
      height: 20,
      width: 20,
      marginRight: 10,
    },
  });