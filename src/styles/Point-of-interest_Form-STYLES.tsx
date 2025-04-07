import { StyleSheet } from "react-native";

export const PoiFormStyles = StyleSheet.create({


  containerAnother: {
    position: 'absolute',
    top: 20,
    left: 0,
    alignItems: 'center',
  },
  button: {
    display: "flex",
    position: "absolute",
    top: 10,
    left: 10,
    height: 40,
    width: 40,
    backgroundColor: "#912338",
    borderRadius: 5,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    zIndex: 1,
    alignContent: "center",
    justifyContent: "center",
    paddingLeft: 7,

  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  container: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 10,
  },
});