import { Dimensions, StyleSheet } from "react-native";

export const MapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
  },
  buttonImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  imageButton: {
    padding: 10,
    backgroundColor: "transparent",
    borderRadius: 40,
  },
  annotationImage: {
    width: 30,
    height: 30,
  },
  toggleButtonContainer: {
    position: "absolute",
    top: 20,
    alignItems: "center",
  },
  marker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    fontSize: 24,
  },
  callout: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    width: 150,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  calloutDescription: {
    fontSize: 14,
  },
});