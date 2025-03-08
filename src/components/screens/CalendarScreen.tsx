import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Button, Modal, TextInput, TouchableOpacity, Dimensions, } from "react-native";
import { CalendarBody, CalendarContainer, CalendarHeader, DraggingEvent, DraggingEventProps, OnCreateEventResponse, EventItem, CalendarKitHandle, } from "@howljs/calendar-kit";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from '@react-navigation/stack';
import Feather from '@expo/vector-icons/Feather';
import MyModal from "../MyModal";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disables strict mode
});

const { height, width } = Dimensions.get('window');

const theme = {
  calendarBackground: '#f0f0f0',
  dayTextColor: '#333',
  selectedDayBackground: '#007bff',
};

const currentWeek = (currentDate?: Date): string => {
  const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  const today = currentDate || new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, etc
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - dayOfWeek + ( dayOfWeek === 0 ? -6 : 1 )) // First day is monday
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);

  let month;
  if (firstDay.getDate() > lastDay.getDate()) {
    return `${months[today.getMonth()]} ${firstDay.getDate()} - ${months[lastDay.getMonth()]} ${lastDay.getDate()}, ${today.getFullYear()}`;
  } else {
    return `${months[today.getMonth()]} ${firstDay.getDate()} - ${lastDay.getDate()}, ${today.getFullYear()}`;
  }
}

const testEvents: EventItem[] = [
  {
    id: '1',
    title: 'Meeting with Team',
    start: { dateTime: '2025-03-15T10:00:00Z' },
    end: { dateTime: '2025-03-15T12:00:00Z' },
    color: '#4285F4',
  },
  {
    id: '2',
    title: 'Conference',
    start: { dateTime: '2025-03-17T00:00:00', timeZone: 'America/New_York' },
    end: { dateTime: '2025-03-18T00:00:00', timeZone: 'America/New_York' },
    color: '#34A853',
  },
  {
    id: '3',
    title: 'Weekly Team Sync',
    start: { dateTime: '2025-03-18T15:00:00Z' },
    end: { dateTime: '2025-03-18T16:00:00Z' },
    color: '#FBBC05',
    recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=MO'
  },
  {
    id: '4',
    title: 'Weekly Team Building Day',
    start: { date: '2025-03-07' },
    end: { date: '2025-03-07' },
    color: '#34A853',
    recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=FR'
  },
  {
    id: '5',
    title: 'Weekly Team Building Day',
    start: { dateTime: '2025-03-08T08:00:00', timeZone: 'America/New_York' },
    end: { dateTime: '2025-03-08T18:00:00', timeZone: 'America/New_York' },
    color: '#34A853',
  },
];


const CalendarScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [currentDay, setCurrentDate] = useState<Date>(new Date());

  const [eventTitle, setEventTitle] = useState(editingEvent?.title || '');


  const handleDragCreateEvent = useCallback((event: OnCreateEventResponse) => {
      const newEvent :EventItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'New Event',
        start: event.start,
        end: event.end,
        color: 'red',
        recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=MO'
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setEditingEvent(newEvent);
      setModalVisible(true);
    }, []);

  const handleEventPress = useCallback((event: EventItem) => {
    setEditingEvent(event);
    setModalVisible(true);
  }, []);

  const handleSaveEvent = () => {
    console.log('Save button pressed');
    if (editingEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((e) => (e.id === editingEvent.id ? editingEvent : e))
      );
    }
    console.log('Attempting to close modal');
    setModalVisible(false);
    console.log('Modal visibility set to false');
  };


const renderDraggingEvent = useCallback((props: DraggingEventProps) => {
  return (
    <DraggingEvent
        {...props}
        TopEdgeComponent={
          <View
            style={{
              height: 10,
              width: '100%',
              backgroundColor: 'red',
              position: 'absolute',
            }}
          />
        }
        BottomEdgeComponent={
          <View
            style={{
              height: 10,
              width: '100%',
              backgroundColor: 'red',
              bottom: 0,
              position: 'absolute',
            }}
          />
        }
      />
  );
}, []);

  useEffect(() => {
    console.log('modalVisible changed:', modalVisible);
  }, [modalVisible]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={{ flexDirection: "row" }} >
          <TouchableOpacity onPress={ () => { navigation.navigate("Home") } } >
            <Feather name="arrow-left-circle" size={40} color="black" style={{ marginTop: 5 }} />
          </TouchableOpacity>
          <View style={styles.buttonContainer} >
            <TouchableOpacity
              onPress={ () => {
                calendarRef.current?.goToPrevPage(true);
                setCurrentDate(new Date(currentDay.setDate(currentDay.getDate() - 7)));
              }}
            >
              <Feather name="chevron-left" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={ () => {
                calendarRef.current?.goToNextPage(true);
                setCurrentDate(new Date(currentDay.setDate(currentDay.getDate() + 7)));
              }}
            >
              <Feather name="chevron-right" size={28} color="black" />
            </TouchableOpacity>
            <Text style={{ paddingLeft: 10 }} >{currentWeek(currentDay)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.todayBTN} onPress={() => calendarRef.current?.goToDate({ date: new Date() })} >
          <Text style={{ color: "white", fontWeight: "bold" }} >TODAY</Text>
        </TouchableOpacity>
      </View>

      {/* Renders the calendar view */}
      <CalendarContainer
        // theme={theme}
        ref={calendarRef}
        allowDragToCreate={true}
        // onDragCreateEventStart={handleDragCreateStart}
        onDragCreateEventEnd={handleDragCreateEvent}
        events={testEvents}
        // events={events}
        dragStep={15}
        onPressEvent={handleEventPress}
      >
        <CalendarHeader />
        <CalendarBody renderDraggingEvent={renderDraggingEvent} />
      </CalendarContainer>

      {/* Testing another modal */}
      {/* <MyModal visible={modalVisible} onClose={ () => { setModalVisible(!modalVisible) } } /> */}

      {/* Modal to edit an event */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log('Modal onRequestClose triggered');
          setModalVisible(false);
        }}
        animationType="fade"
      >
        <View style={styles.modalContainer} >
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Edit Event</Text>
            <TextInput style={styles.input} />
            <TextInput
              style={styles.input}
              value={editingEvent?.title || ''}
              onChangeText={(text) => {
                if (editingEvent) {
                  setEditingEvent({ ...editingEvent, title: text });
                }
              }}
              placeholder="Event Title"
            />

            <View onTouchEnd={() => { setModalVisible(false); } } >
              <Button title="Cancel 2" onPress={ () => console.log('Modal content touched')} />
            </View>
            <Button title="Save" onPress={() => { handleSaveEvent(); }} />
            <Button title="Cancel 3" onPress={() => { setModalVisible(false); }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 3,
    padding: 10,
  },
  todayBTN: {
    height: 40,
    width: 55,
    backgroundColor: "#912338",
    padding: 5,
    justifyContent: "center",
    borderRadius: 15,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: width,
    height: height,
  },
  modalContent: {
    width: width * 0.8,
    height: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
    elevation: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "80%",
  },
});

export default CalendarScreen;
