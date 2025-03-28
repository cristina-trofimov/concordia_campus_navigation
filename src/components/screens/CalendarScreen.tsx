import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Button, Modal, TextInput, TouchableOpacity, } from "react-native";
import { CalendarBody, CalendarContainer, CalendarHeader, DraggingEvent, DraggingEventProps, EventItem, CalendarKitHandle, } from "@howljs/calendar-kit";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from '@react-navigation/stack';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CalendarStyle } from "../../styles/CalendarStyle";
import RightDrawer from "../RightDrawer";
import { Calendar } from "../../interfaces/calendar";
import { fetchCalendarEventsByCalendarId } from "../googleCalendarFetching";
import { signIn } from "../HandleGoogle";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const theme = {
  calendarBackground: '#f0f0f0',
  dayTextColor: '#333',
  selectedDayBackground: '#007bff',
};

const CalendarScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [chosenCalendar, setChosenCalendar] = useState<Calendar | null>(null);

  const currentWeek = (currentDate: Date) => {
    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
    const today = currentDate || new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, etc
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - dayOfWeek + ( dayOfWeek === 0 ? -6 : 1 )) // First day is monday
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
  
    if (firstDay.getDate() > lastDay.getDate()) {
      return `${months[today.getMonth()]} ${firstDay.getDate()} - ${months[lastDay.getMonth()]} ${lastDay.getDate()}, ${today.getFullYear()}`;
    } else {
      return `${months[today.getMonth()]} ${firstDay.getDate()} - ${lastDay.getDate()}, ${today.getFullYear()}`;
    }
  }

  const handleWeekChange = (days) => {
    // setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    const newDate = new Date(currentDate);
    // newDate.setDate(newDate.getTime() + days * 24 * 60 * 60 * 1000);
    newDate.setDate(newDate.getDate() + days);
    // setCurrentDate(newDate);
    calendarRef.current?.goToDate({ date: newDate, animatedDate: true });
    // calendarRef.current?.goToDate({ date: newDate, animatedDate: true, triggerOnDateChanged: true });
  };

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
          <TouchableOpacity style={CalendarStyle.backBTN} onPress={() => { navigation.navigate("Home") }} >
            <Ionicons name="arrow-back-outline" size={32} color="#912338" />
            <Text style={{ color: "#912338", fontSize: 18, fontWeight: "bold", margin: 2.5 }} >Map</Text>
          </TouchableOpacity>
        </View>

        {/* we want to keep the functionality so I will keep the code heer, but it needs to be better placed */}
        <TouchableOpacity style={CalendarStyle.todayBTN} onPress={() => calendarRef.current?.goToDate({ date: new Date() })} >
          <MaterialIcons name="today" size={24} color="white" />
          <Text style={{ color: "white", fontWeight: "bold", margin: 2.5 }} >TODAY</Text>
        </TouchableOpacity>

        <RightDrawer setChosenCalendar={setChosenCalendar} />
      </View>

      <View style={CalendarStyle.headerCalendarButtonsContainer} >
        <TouchableOpacity
          onPress={ () => {
            handleWeekChange(-7)
            // console.log(`~~~****~~~~~~~~~Old Current Date: ${currentDate}`);
            
            // setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
            
            // console.log(`~~~~****~~~~~~~~New Current Date: ${currentDate}`);

            // calendarRef.current?.goToDate({ date: currentDate, animatedDate: true });

            // calendarRef.current?.goToPrevPage(true, false);
            
          // onPress={() => {
          //   calendarRef.current?.goToPrevPage(true);
          //   setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
          }}
        >
          <Feather name="chevron-left" size={30} color="black" />
        </TouchableOpacity>

        <Text style={{ paddingLeft: 10, marginTop: 5 }} >{currentWeek(currentDate)}</Text>

        <TouchableOpacity
          onPress={() => {
            calendarRef.current?.goToNextPage(true);
          }}
        >
          <Feather name="chevron-right" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Renders the calendar view */}
      <CalendarContainer
        // key={currentDate.toISOString()}
        ref={calendarRef}
        initialDate={currentDate.toISOString()}
        onDateChanged={(date) => { setCurrentDate(new Date(date)) }}
        allowDragToCreate={true}
        // onDragCreateEventStart={handleDragCreateStart}
        // onDragCreateEventEnd={handleDragCreateEvent}
        events={events}
        dragStep={15}
        onChange={(dateString) => { currentWeek(new Date(dateString)) }}
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
