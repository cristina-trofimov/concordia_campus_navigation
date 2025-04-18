import { StyleSheet } from "react-native";

export const ShuttleBusTransitStyle = StyleSheet.create({
    container: {
        marginVertical: 10,
        padding: 15,
        backgroundColor: "#f8f8f8",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#912338", // Concordia maroon
      },
      infoContainer: {
        marginBottom: 12,
      },
      title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#912338", // Concordia maroon
        marginBottom: 8,
      },
      info: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
      },
      schedule: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
      },
      stationInfo: {
        fontSize: 12,
        fontStyle: "italic",
        color: "#555",
      },
      button: {
        backgroundColor: "#912338", // Concordia maroon
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 25,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
      },
      buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
      },
      subtitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 8,
        marginBottom: 4,
        color: "#912338", 
      },
});