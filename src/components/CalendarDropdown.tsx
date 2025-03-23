import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar } from '../interfaces/calendar';

const CalendarDropdown = ({ calendars, setChosenCalendar }: { calendars: Calendar[], setChosenCalendar: (calendar: Calendar) => void }) => {

    const [selectedCalendar, setSelectedCalendar] = useState<Calendar>(calendars[0]);

    const handleCalendarChange = (itemValue: Calendar) => {
        setSelectedCalendar(itemValue);
        const selected = calendars.find(cal => cal.id === itemValue.id);
        if (selected) {
            setChosenCalendar(selected);
        }
    };

    return (
        <View style={styles.container}>
            <Ionicons name="calendar-outline" size={24} color="black" style={styles.icon} />
            <Picker
                selectedValue={selectedCalendar}
                style={styles.picker}
                onValueChange={handleCalendarChange}
            >
                {calendars.map((calendar) => (
                    <Picker.Item key={calendar.id} label={calendar.title} value={calendar} />
                ))}
            </Picker>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginTop: 20,
        paddingHorizontal: 10,
    },
    icon: {
        marginRight: 10,
    },
    picker: {
        flex: 1,
        height: 50,
    },
});

export default CalendarDropdown;
