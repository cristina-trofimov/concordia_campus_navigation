import { StyleSheet } from "react-native";

export const IndoorViewButtonStyle = StyleSheet.create({
    button: {
        paddingVertical: 7,
        paddingHorizontal: 15,
        borderRadius: 25,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "500",
    }
});