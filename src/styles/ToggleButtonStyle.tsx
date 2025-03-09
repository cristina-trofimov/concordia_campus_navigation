import { StyleSheet } from "react-native";

export const ToggleButtonStyle = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    slider: {
        backgroundColor: 'white',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 10,
    },
    knob: {
        backgroundColor: '#8D1919',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    labelsContainer: {
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 1,
    },
    labelContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelText: {
        fontWeight: 'bold',
    },
    activeLabel: {
        color: 'white',
    },
    inactiveLabel: {
        color: 'black',
    },
});