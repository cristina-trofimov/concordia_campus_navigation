import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Icon } from 'react-native-elements';
import BuildingLocation from '../interfaces/buildingLocation';
import { BuildingInfoStyle } from '../styles/BuildingInfoStyle';
import analytics from '@react-native-firebase/analytics';
import { useCoords } from '../data/CoordsContext';
import IndoorViewButton from './IndoorViewButton';
import { useIndoor } from '../data/IndoorContext';
import Entypo from '@expo/vector-icons/Entypo';

interface BuildingInformationProps {
    isVisible: boolean;
    onClose: () => void;
    buildingLocation: BuildingLocation | null;
    setInputDestination: (inputDestination: string) => void;
    setInputOrigin: (inputOrigin: string) => void;
}
const stopTimerAndLogEvent = (title: string) => {
  if ((globalThis as any).isTesting && (globalThis as any).taskTimer.isStarted()) {
    // Stop the timer and get the elapsed time

    const elapsedTime = (globalThis as any).taskTimer.stop();
    // Log the custom event with building name and the elapsed time
      analytics().logEvent('Task_1_finished', {
        building_name: title,
        elapsed_time: elapsedTime/1000,  // Add the elapsed time
        user_id: (globalThis as any).userId,
      });
  }
};

const BuildingInformation: React.FC<BuildingInformationProps> = ({ isVisible, onClose, buildingLocation, setInputDestination, setInputOrigin }) => {
    const { title, description, buildingInfo, coordinates } = buildingLocation || {};
    const { photo, address, departments, services } = buildingInfo || {};
    const { setDestinationCoords, setOriginCoords, destinationCoords } = useCoords();
    const { inFloorView } = useIndoor();
    const buildingId = (title ?? "").split(" ")[0];


    return (
        <Modal isVisible={isVisible} onBackdropPress={onClose} onBackButtonPress={onClose}>
            <View style={BuildingInfoStyle.modalContent}>
                <ScrollView>
                    <View style={BuildingInfoStyle.card}>
                        <View style={BuildingInfoStyle.titleContainer}>
                            <Text style={BuildingInfoStyle.title}>{title}</Text>
                        </View>
                        <View style={BuildingInfoStyle.buttonsContainer}>
                            {/* Indoor View Button */}
                            {!destinationCoords && (
                                <IndoorViewButton
                                    inFloorView={inFloorView}
                                    buildingId={buildingId}
                                    onClose={onClose}
                                />
                            )}
                            {/* Origin Location Button */}
                            {destinationCoords && (
                                <TouchableOpacity
                                    style={BuildingInfoStyle.actionButton}
                                    onPress={() => {
                                        setInputOrigin(address ?? "");
                                        if (coordinates) {
                                            const [longitude, latitude] = coordinates;
                                            setOriginCoords({ latitude, longitude });
                                        }
                                        onClose();
                                    }}
                                >
                                    <Entypo name="location" size={32} color="white" />
                                </TouchableOpacity>
                            )}
                            {/* Destination Location Button */}
                            <TouchableOpacity
                                style={BuildingInfoStyle.actionButton}
                                onPress={() => {
                                    setInputDestination(address ?? "");
                                    if(title=== "H Henry F. Hall Building"){
                                          stopTimerAndLogEvent(title);
                                        }
                                    if (coordinates) {
                                        const [longitude, latitude] = coordinates;
                                        setDestinationCoords({ latitude, longitude });
                                    }
                                    onClose();
                                }}
                            >
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
                                {departments.map((dept) => (
                                    <Text key={dept} style={BuildingInfoStyle.listItem}>
                                        {dept}
                                    </Text>
                                ))}
                            </View>
                        )}
                        {services && services.length > 0 && (
                            <View style={BuildingInfoStyle.infoSection}>
                                <Text style={BuildingInfoStyle.sectionTitle}>Services:</Text>
                                {services.map((service) => (
                                    <Text key={service} style={BuildingInfoStyle.listItem}>
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
