import { StyleSheet } from 'react-native';

export const RightDrawerStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 15,
        right: 0, // Change from left: 0 to right: 0
        alignItems: 'center',
    },
    button: {
        position: "absolute",
        top: 0,
        right: 10, // Change from left: 10 to right: 10
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
        alignItems: "flex-end", // Change from flex-start to flex-end
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
        justifyContent: 'center',
        alignContent: 'center',
        gap: 20,
        padding: 5,
        marginTop: 20,
    },
    signInButtonView: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    calendarList: {
        marginTop: 20,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        padding: 10,
    },
    calendarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    calendarItemText: {
        fontSize: 16,
        marginLeft: 10,
        flex: 1,
    },
    calendarIcon: {
        marginRight: 10,
    },
});
