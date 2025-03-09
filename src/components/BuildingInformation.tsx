import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Icon } from 'react-native-elements'; 
import BuildingInfo from '../interfaces/buildingLocationInfo';
import BuildingLocation from '../interfaces/buildingLocation';
import { BuildingInfoStyle } from '../styles/BuildingInfoStyle';

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
            <View style={BuildingInfoStyle.modalContent}>
                <ScrollView>
                    <View style={BuildingInfoStyle.card}>
                        <View style={BuildingInfoStyle.titleContainer}>
                            <Text style={BuildingInfoStyle.title}>{title}</Text>
                            <TouchableOpacity style={BuildingInfoStyle.actionButton} onPress={() => console.log('Button Pressed')}>
                                <Icon
                                    name="directions"
                                    type="material"  
                                    size={32}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={BuildingInfoStyle.divider} />
                        {photo && (
                            <Image
                                source={{ uri: photo }}
                                style={BuildingInfoStyle.image}
                            />
                        )}
                        {address && (
                            <View style={BuildingInfoStyle.infoRow}>
                                <Icon name="map-pin" type="font-awesome" size={16} color="grey" />
                                <Text style={BuildingInfoStyle.address}>{address}</Text>
                            </View>
                        )}
                        {description && (
                            <View style={BuildingInfoStyle.infoRow}>
                                <Text style={BuildingInfoStyle.description}>{description}</Text>
                            </View>
                        )}
                        {departments && departments.length > 0 && (
                            <View style={BuildingInfoStyle.infoSection}>
                                <Text style={BuildingInfoStyle.sectionTitle}>Departments:</Text>
                                {departments.map((dept, index) => (
                                    <Text key={index} style={BuildingInfoStyle.listItem}>
                                        {dept}
                                    </Text>
                                ))}
                            </View>
                        )}
                        {services && services.length > 0 && (
                            <View style={BuildingInfoStyle.infoSection}>
                                <Text style={BuildingInfoStyle.sectionTitle}>Services:</Text>
                                {services.map((service, index) => (
                                    <Text key={index} style={BuildingInfoStyle.listItem}>
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


export default BuildingInformation;
