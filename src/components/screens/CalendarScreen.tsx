import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Button, Modal, TextInput, TouchableOpacity, } from "react-native";
import { CalendarBody, CalendarContainer, CalendarHeader, DraggingEvent, DraggingEventProps, EventItem, CalendarKitHandle, } from "@howljs/calendar-kit";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from '@react-navigation/stack';
import Feather from '@expo/vector-icons/Feather';
import { CalendarStyle } from "../../styles/CalendarStyle";
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import { signIn } from "../signin";
import { signOut } from "../signout";
import { WEBCLIENTID } from '@env'


GoogleSignin.configure({
  webClientId: WEBCLIENTID, // You need to fill this in with your actual web client ID
  scopes: ['email', 'profile','https://www.googleapis.com/auth/calendar'],
  offlineAccess: true,
  forceCodeForRefreshToken: false,
});
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disables strict mode
});


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
  const [isSignedIn, setIsSignedIn] = useState(false);
  
    const handleSignIn = () => {
      signIn().then(() => setIsSignedIn(true));
    };
  
    const handleSignOut = () => {
      signOut().then(() => setIsSignedIn(false));
    };

    

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [currentDay, setCurrentDate] = useState<Date>(new Date());

  const [eventTitle, setEventTitle] = useState(editingEvent?.title ?? '');


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
    <React.Fragment>
      
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
    </React.Fragment>
  );
}, []);

  useEffect(() => {
    console.log('modalVisible changed:', modalVisible);
  }, [modalVisible]);

  return (
    <View style={CalendarStyle.container}>
      {/* Header */}
      <View style={CalendarStyle.headerContainer}>
        <View style={{ flexDirection: "row" }} >
          <TouchableOpacity onPress={ () => { navigation.navigate("Home") } } >
            <Feather name="arrow-left-circle" size={40} color="black" style={{ marginTop: 5 }} />
          </TouchableOpacity>
          <View style={CalendarStyle.headerButtonsContainer} >
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
        <TouchableOpacity style={CalendarStyle.todayBTN} onPress={() => calendarRef.current?.goToDate({ date: new Date() })} >
          <Text style={{ color: "white", fontWeight: "bold" }} >TODAY</Text>
        </TouchableOpacity>
      </View>

      {/* Renders the calendar view */}
      <CalendarContainer
        // theme={theme}
        ref={calendarRef}
        allowDragToCreate={true}
        // onDragCreateEventStart={handleDragCreateStart}
        // onDragCreateEventEnd={handleDragCreateEvent}
        events={testEvents}
        // events={events}
        dragStep={15}
        // onPressEvent={handleEventPress}
      >
        <CalendarHeader />
        <CalendarBody renderDraggingEvent={renderDraggingEvent} />
      </CalendarContainer>

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
        <View style={CalendarStyle.modalContainer} >
          <View style={CalendarStyle.modalContent}>
            <Text style={CalendarStyle.modalText}>Edit Event</Text>
            <TextInput style={CalendarStyle.input} />
            <TextInput
              style={CalendarStyle.input}
              value={editingEvent?.title ?? ''}
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
      <View style={CalendarStyle.signInButtonView}>
      {!isSignedIn ? (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleSignIn}

        />
      ) : (
        <Button title="Sign Out" onPress={handleSignOut} />
      )}
      </View>
    </View>
  );
};



export default CalendarScreen;
