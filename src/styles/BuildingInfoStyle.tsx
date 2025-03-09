import { StyleSheet } from "react-native";

export const BuildingInfoStyle = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionButton: {
        backgroundColor: '#912338',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
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
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        margin: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#e1e8ee',
        marginVertical: 8,
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        borderRadius: 8,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    address: {
        fontSize: 16,
        marginLeft: 8,
    },
    description: {
        fontSize: 14,
        marginTop: 8,
        marginBottom: 16,
    },
    infoSection: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    listItem: {
        fontSize: 16,
        marginBottom: 4,
    },
    closeButton: {
        backgroundColor: 'rgba(39, 39, 39, 1)',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 16,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});