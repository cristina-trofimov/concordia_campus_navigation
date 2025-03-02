import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Icon } from 'react-native-elements'; // Keep Icon if you still want to use it
import BuildingInfo from '../interfaces/buildingLocationInfo';
import BuildingLocation from '../interfaces/buildingLocation';

interface BuildingInformationProps {
    isVisible: boolean;
    onClose: () => void;
    buildingLocation: BuildingLocation | null;

}

const BuildingInformation: React.FC<BuildingInformationProps> = ({ isVisible, onClose, buildingLocation }) => {
    const { title, description, buildingInfo } = buildingLocation || {};
    const { photo, address, departments, services } = buildingInfo || {};

    return (
        <Modal isVisible={isVisible} onBackdropPress={onClose} onBackButtonPress={onClose}>
            <View style={styles.modalContent}>
                <ScrollView>
                    <View style={styles.card}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Button Pressed')}>
                                <Icon
                                    name="directions"
                                    type="material"  
                                    size={32}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />
                        {photo && (
                            <Image
                                source={{ uri: photo }}
                                style={styles.image}
                            />
                        )}
                        {address && (
                            <View style={styles.infoRow}>
                                <Icon name="map-pin" type="font-awesome" size={16} color="grey" />
                                <Text style={styles.address}>{address}</Text>
                            </View>
                        )}
                        {description && (
                            <View style={styles.infoRow}>
                                <Text style={styles.description}>{description}</Text>
                            </View>
                        )}
                        {departments && departments.length > 0 && (
                            <View style={styles.infoSection}>
                                <Text style={styles.sectionTitle}>Departments:</Text>
                                {departments.map((dept, index) => (
                                    <Text key={index} style={styles.listItem}>
                                        {dept}
                                    </Text>
                                ))}
                            </View>
                        )}
                        {services && services.length > 0 && (
                            <View style={styles.infoSection}>
                                <Text style={styles.sectionTitle}>Services:</Text>
                                {services.map((service, index) => (
                                    <Text key={index} style={styles.listItem}>
                                        {service}
                                    </Text>
                                ))}
                            </View>
                        )}

                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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

export default BuildingInformation;
