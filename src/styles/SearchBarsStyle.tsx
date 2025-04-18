import { StyleSheet } from "react-native";

export const SearchBarsStyle = StyleSheet.create({

    container: {
        width: '100%',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    transportButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        paddingBottom: 10,
        borderBottomColor: "#ddd",
    },
    transportButton: {
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
    },
    selectedTransportButton: {
        alignItems: "center",
        padding: 5,
        backgroundColor: "rgba(145, 35, 56, 0.3)",
    },
    instructionContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    selectedModeContainer: {
        width: "100%",
        alignItems: "flex-start",
        paddingHorizontal: 20,
    },
    selectedModeText: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "left",
        marginVertical: 5,
    },
    transportButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 15,
        paddingVertical: 3,
        borderRadius:20,
    },
    timeText: {
        fontSize: 12,
    },
    timeContainer: {
        alignItems: "center",
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    timeValue: {
        fontSize: 18,
        fontWeight: "bold",
    },
    timeUnit: {
        fontSize: 14,
        color: "#666",
    },
    buttonsContainer: {
        flexDirection: "row",
        gap: 30,
    },
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
    },
});