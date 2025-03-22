import { StyleSheet } from "react-native";

export const FloorSelectorStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '3%',
        zIndex: 1000,
        width: 150,
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#cccccc',
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    },
    selectedFloorText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    arrowIcon: {
        fontSize: 12,
        color: '#000000',
    },
    dropdownOptions: {
        marginTop: 5,
        backgroundColor: '#ffffff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#cccccc',
        width: '100%', 
    },
    option: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
    },
    optionText: {
        fontSize: 16,
    },
})