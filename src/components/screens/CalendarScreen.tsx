import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button, Modal, TextInput, TouchableOpacity, } from "react-native";
import { CalendarBody, CalendarContainer, CalendarHeader, EventItem, CalendarKitHandle, } from "@howljs/calendar-kit";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CalendarScreenProp, RootStackParamList } from "../../../App";
import { StackNavigationProp } from '@react-navigation/stack';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CalendarStyle } from "../../styles/CalendarStyle";
import RightDrawer from "../RightDrawer";
import { Calendar } from "../../interfaces/calendar";
import { fetchCalendarEventsByCalendarId } from "../googleCalendarFetching";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const theme = {
  calendarBackground: '#f0f0f0',
  dayTextColor: '#333',
  selectedDayBackground: '#007bff',
};

const CalendarScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [chosenCalendar, setChosenCalendar] = useState<Calendar | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const currentWeek = (currentDate: Date) => {
    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
    const date = currentDate || new Date();
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, etc
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - dayOfWeek + ( dayOfWeek === 0 ? -6 : 1 )) // First day is monday
    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
  
    if (firstDay.getDate() > lastDay.getDate()) {
      return `${months[date.getMonth()]} ${firstDay.getDate()} - ${months[lastDay.getMonth()]} ${lastDay.getDate()}, ${date.getFullYear()}`;
    } else {
      return `${months[date.getMonth()]} ${firstDay.getDate()} - ${lastDay.getDate()}, ${date.getFullYear()}`;
    }
  }

  const handleWeekChange = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    // days < 0 ? calendarRef.current?.goToPrevPage(true, true) : calendarRef.current?.goToNextPage(true, true)
    // calendarRef.current?.goToDate({ date: newDate, animatedDate: true });
  };

  useEffect(() => {
    console.log("Updated current date:", currentDate);
}, [currentDate]);

  const route = useRoute<CalendarScreenProp>();
  const accessToken = route.params?.accessToken;

  useEffect(() => {
    const fetchEvents = async () => {
        if (chosenCalendar && accessToken) {
          const events = await fetchCalendarEventsByCalendarId(accessToken, chosenCalendar.id);
          const modifiedEvents = events.data?.events.map((event) => {
            // console.log(`CALENDAR EVENT\N\N${event}`);
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
    fetchEvents();

  }, [chosenCalendar]);

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const storedValue = await AsyncStorage.getItem("chosenCalendar");
        setChosenCalendar(storedValue ? JSON.parse(storedValue) : null);
      } catch (error) {
        console.error('Failed to load calendar:', error);
        setChosenCalendar(null);
      }
    };
  
    loadCalendar();
  }, []);


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

        {/* <TouchableOpacity style={CalendarStyle.todayBTN} onPress={() => calendarRef.current?.goToDate({ date: new Date() })} > */}
        <TouchableOpacity style={CalendarStyle.todayBTN} onPress={() => setCurrentDate(new Date()) } >
          <MaterialIcons name="today" size={24} color="white" />
          <Text style={{ color: "white", fontWeight: "bold", margin: 2.5 }} >TODAY</Text>
        </TouchableOpacity>

        <RightDrawer setChosenCalendar={setChosenCalendar} />
      </View>

      <View style={CalendarStyle.headerCalendarButtonsContainer} >
        <TouchableOpacity onPress={ () => {handleWeekChange(-7)}} >
          <Feather name="chevron-left" size={30} color="black" />
        </TouchableOpacity>

        <Text style={{ paddingLeft: 10, marginTop: 5 }} >{currentWeek(currentDate)}</Text>

        <TouchableOpacity onPress={ () => {handleWeekChange(7)}} >
          <Feather name="chevron-right" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Renders the calendar view */}
      <CalendarContainer
        key={currentDate.toISOString()}
        ref={calendarRef}
        events={events}
        initialDate={currentDate.toISOString()}
        // onDateChanged={(date) => {
        //   console.log("onDateChanged triggered with:", date);
        //   const newDate = new Date(date);
        //   console.log("New date:", newDate.toISOString(), "Current date:", currentDate.toISOString());
        //   if (newDate.toISOString() !== currentDate.toISOString()) {
        //       setCurrentDate(new Date(date));
        //       console.log("State updated with:", newDate.toISOString());
        //   } else {
        //       console.log("State not updated as dates are identical.");
        //   }
        // }}

        // onChange={(dateString) => { 
        //   console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!onChange called\nDateString: ${dateString}\ncurrentDate: ${currentDate}`); 
        //   setCurrentDate(new Date(dateString)) 
        //   // calendarRef.current?.goToDate({ date: currentDate, animatedDate: false })
        // }}
      >
        <CalendarHeader />
        <CalendarBody />
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
            <Button title="Cancel 3" onPress={() => { setModalVisible(false); }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CalendarScreen;
