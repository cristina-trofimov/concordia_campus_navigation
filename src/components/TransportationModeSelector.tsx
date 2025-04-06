import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { SearchBarsStyle } from '../styles/SearchBarsStyle';

export interface TransportMode {
    mode: string;
    icon: string;
    label: string;
    time: string;
    color: string;
}

interface TransportModeSelectorProps {
    transportModes: TransportMode[];
    selectedMode: string;
    setSelectedMode: (mode: string) => void;
}

const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
    transportModes,
    selectedMode,
    setSelectedMode
}) => {
    return (
        <>
            {/* Selected Transport Mode Title */}
            <View style={SearchBarsStyle.selectedModeContainer}>
                <Text style={SearchBarsStyle.selectedModeText}>
                    {transportModes.find((t) => t.mode === selectedMode)?.label}
                </Text>
            </View>

            {/* Transport Buttons with Time Estimates */}
            <View style={SearchBarsStyle.transportButtonContainer}>
                {transportModes.map(({ mode, icon, color }) => (
                    <TouchableOpacity
                        key={mode}
                        testID={`transport-mode-${mode}`}
                        onPress={() => setSelectedMode(mode)}
                    >
                        <View style={[
                            SearchBarsStyle.transportButtonContent,
                            selectedMode === mode && SearchBarsStyle.selectedTransportButton
                        ]}>
                            <View style={SearchBarsStyle.transportButtonContent}>
                                <Ionicons
                                    name={icon as keyof typeof Ionicons.glyphMap}
                                    size={24}
                                    color='black'
                                />
                                {selectedMode === mode}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
};

export default TransportModeSelector;