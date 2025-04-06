import { StyleSheet, Platform } from "react-native";

export const FloorSelectorStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '3%',
        zIndex: 1000,
        width: 150,
        flexDirection: 'row',
        alignItems: 'center',
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
        position: 'absolute',
        top: 45,
        left: 50,
        backgroundColor: '#ffffff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#cccccc',
        width: '100%',
        zIndex: 1001,
    },
    option: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
    },
    optionText: {
        fontSize: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
})