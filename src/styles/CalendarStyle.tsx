import { Dimensions, StyleSheet } from 'react-native';

const { height, width } = Dimensions.get('window');

export const CalendarStyle = StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 10,
    },
    calendarButtonContainer: {
      position: 'absolute',
      top: 20,
      right: 0,
      alignItems: 'center',
    },
    calBtn: {
      position: "absolute",
      top: 10,
      right: 10,
      height: 40,
      width: 40,
      backgroundColor: "#912338",
      borderRadius: 5,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      zIndex: 1,
    },
    calButtonImg: {
      margin: 7,
    },
    headerButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 3,
      padding: 10,
    },
    todayBTN: {
      height: 40,
      width: 55,
      backgroundColor: "#912338",
      padding: 5,
      justifyContent: "center",
      borderRadius: 15,
    },
    modalContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      width: width,
      height: height,
    },
    modalContent: {
      width: width * 0.8,
      height: height * 0.8,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      zIndex: 1000,
      elevation: 15,
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      width: "80%",
    },
    signInButtonView: {
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
