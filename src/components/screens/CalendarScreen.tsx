import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Button, Modal, TextInput, TouchableOpacity, } from "react-native";
import { CalendarBody, CalendarContainer, CalendarHeader, DraggingEvent, DraggingEventProps, EventItem, CalendarKitHandle, } from "@howljs/calendar-kit";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from '@react-navigation/stack';
import Feather from '@expo/vector-icons/Feather';
import { CalendarStyle } from "../../styles/CalendarStyle";
import RightDrawer from "../RightDrawer";
import { Calendar } from "../../interfaces/calendar";
import { fetchCalendarEventsByCalendarId } from "../googleCalendarFetching";
import { signIn } from "../signin";

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
  firstDay.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)) // First day is monday
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);

  if (firstDay.getDate() > lastDay.getDate()) {
    return `${months[today.getMonth()]} ${firstDay.getDate()} - ${months[lastDay.getMonth()]} ${lastDay.getDate()}, ${today.getFullYear()}`;
  } else {
    return `${months[today.getMonth()]} ${firstDay.getDate()} - ${lastDay.getDate()}, ${today.getFullYear()}`;
  }
}

const CalendarScreen = () => {

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [chosenCalendar, setChosenCalendar] = useState<Calendar | null>(null);


  const handleSaveEvent = () => {
    if (editingEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((e) => (e.id === editingEvent.id ? editingEvent : e))
      );
    }
    setModalVisible(false);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (chosenCalendar) {
        const accessToken = await signIn();
        if (accessToken) {
          const events = await fetchCalendarEventsByCalendarId(accessToken, chosenCalendar.id);
          const modifiedEvents = events.data?.events.map((event) => {
            return {
              id: event.id,
              title: event.title,
              start: { dateTime: event.startTime },
              end: { dateTime: event.endTime },
              color: '#4285F4',
            };
          })
          setEvents(modifiedEvents || []);
        }

      }

    }
    fetchEvents();

  }, [chosenCalendar]);


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
  }, [modalVisible]);

  return (
    <View style={CalendarStyle.container}>
      {/* Header */}
      <View style={CalendarStyle.headerContainer}>
        <View style={{ flexDirection: "row" }} >
          <TouchableOpacity onPress={() => { navigation.navigate("Home") }} >
            <Feather name="arrow-left-circle" size={40} color="black" style={{ marginTop: 5 }} />
          </TouchableOpacity>
          <View style={CalendarStyle.headerButtonsContainer} >
            <TouchableOpacity
              onPress={() => {
                calendarRef.current?.goToPrevPage(true);
                setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
              }}
            >
              <Feather name="chevron-left" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                calendarRef.current?.goToNextPage(true);
                setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
              }}
            >
              <Feather name="chevron-right" size={28} color="black" />
            </TouchableOpacity>
            <Text style={{ paddingLeft: 10 }} >{currentWeek(currentDate)}</Text>

          </View>
        </View>
        {/* we want to keep the functionality so I will keep the code heer, but it needs to be better placed */}
        {/* <TouchableOpacity style={CalendarStyle.todayBTN} onPress={() => calendarRef.current?.goToDate({ date: new Date() })} >
          <Text style={{ color: "white", fontWeight: "bold" }} >TODAY</Text>
        </TouchableOpacity> */}
        <RightDrawer setChosenCalendar={setChosenCalendar} />

      </View>

      {/* Renders the calendar view */}
      <CalendarContainer
        ref={calendarRef}
        allowDragToCreate={true}
        events={events}
        dragStep={15}
      >
        <CalendarHeader />
        <CalendarBody renderDraggingEvent={renderDraggingEvent} />
      </CalendarContainer>

      {/* Modal to edit an event */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
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

            <View onTouchEnd={() => { setModalVisible(false); }} >
              <Button title="Cancel 2" onPress={() => { setModalVisible(false); console.log('Modal content touched') }} />
            </View>
            <Button title="Save" onPress={() => { handleSaveEvent(); }} />
            <Button title="Cancel 3" onPress={() => { setModalVisible(false); }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CalendarScreen;
