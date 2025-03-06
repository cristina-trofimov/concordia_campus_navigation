import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Button, Modal, TextInput, TouchableOpacity, Dimensions, Image } from "react-native";
import { CalendarBody, CalendarContainer, CalendarHeader, DraggingEvent, DraggingEventProps, OnCreateEventResponse, EventItem, CalendarKitHandle, } from "@howljs/calendar-kit";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from '@react-navigation/stack';
import MyModal from "../MyModal";

// const windowWidth = Dimensions.get('window').width;
// const windowHeight = Dimensions.get('window').height;

const { height, width } = Dimensions.get('window');

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
    // recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=FR'
  },
];

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disables strict mode
});

const CalendarScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const calendarRef = useRef<CalendarKitHandle>(null);

  const [eventTitle, setEventTitle] = useState(editingEvent?.title || '');


  // const handleDragCreateStart = useCallback((event: OnCreateEventResponse) => {
  //   console.log('Started creating event at:', event.start);
  // }, []);

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
      <TextInput
          style={styles.input}
          // onChangeText={onChangeText}
          // value={""}
        />
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={{ flexDirection: "row" }} >
          <TouchableOpacity onPress={ () => { navigation.navigate("Home") } } >
            <Image style={styles.backBTN} source={require("../../resources/images/icons8-back.png")}
            />
          </TouchableOpacity>
          <View style={styles.buttonContainer} >
            <TouchableOpacity onPress={ () => { calendarRef.current?.goToPrevPage(true); console.log("prev") } }>
              <Image style={styles.image} source={require("../../resources/images/icons8-chevron-left.png")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={ () => { calendarRef.current?.goToNextPage(true); console.log("next") } } >
              <Image style={styles.image} source={require("../../resources/images/icons8-chevron-right.png")}
              />
            </TouchableOpacity>
            <Text style={{ paddingLeft: 10 }} >Date here</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.todayBTN} onPress={() => calendarRef.current?.goToDate({ date: new Date() })} >
          <Text style={{ color: "white", fontWeight: "bold" }} >TODAY</Text>
        </TouchableOpacity>
        {/* <Button title="Today" color={"#912338"} onPress={() => calendarRef.current?.goToDate({ date: new Date() })} /> */}
      </View>

      {/* Renders the calendar view */}
      <CalendarContainer
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
        // animationType="slide"
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
              // onChangeText={(text) => setEventTitle(text)}
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
  backBTN: {
    height: 45,
    width: 45,
  },
  todayBTN: {
    height: 40,
    width: 55,
    backgroundColor: "#912338",
    padding: 5,
    justifyContent: "center",
  },
  image: {
    height: 20,
    width: 20,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: width,
    height: height,
    // zIndex: 1000,
    // elevation: 10,
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
  // modalBTN: {
  //   zIndex: 10,
  // },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "80%",
  },
});

export default CalendarScreen;
