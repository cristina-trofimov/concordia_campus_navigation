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
import { ClassEventsProvider, useClassEvents } from "../../data/ClassEventsContext";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CalendarScreen = () => {
  const route = useRoute<CalendarScreenProp>();
  const accessToken = route.params?.accessToken;
  const open = route.params?.open;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const calendarRef = useRef<CalendarKitHandle>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [chosenCalendar, setChosenCalendar] = useState<Calendar | null>(null);
  const { setClassEvents } = useClassEvents();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const currentWeek = (currentDate: Date) => {
    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
    const date = currentDate || new Date();
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, etc
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)) // First day is monday
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
    calendarRef.current?.goToDate({ date: newDate, animatedDate: true })
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (chosenCalendar && accessToken) {
        const events = await fetchCalendarEventsByCalendarId(accessToken, chosenCalendar.id);

        const today = new Date()
        today.setHours(0, 0, 0, 0);
        const max = new Date();
        max.setDate(max.getDate() + 3);
        max.setHours(23, 59, 59, 999);

        const recentEvents = events.data?.events?.filter(event => {
          return new Date(event.startTime) >= today && new Date(event.endTime) <= max
        }) ?? [];

        setClassEvents(recentEvents);

        const modifiedEvents = events.data?.events?.map((event) => {
          return {
            id: event.id,
            title: event.title,
            start: { dateTime: event.startTime },
            end: { dateTime: event.endTime },
            color: '#FFF3B0',
          };
        }) ?? [];
        setEvents(modifiedEvents);
      }
    }
    fetchEvents();
  }, [chosenCalendar, accessToken]);

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
    <ClassEventsProvider>
      <View style={CalendarStyle.container}>
        {/* Header */}
        <View style={CalendarStyle.headerContainer}>
          <View style={{ flexDirection: "row" }} >
            <TouchableOpacity style={CalendarStyle.backBTN} onPress={() => { navigation.navigate("Home") }} >
              <Ionicons name="arrow-back-outline" size={32} color="#912338" />
              <Text style={{ color: "#912338", fontSize: 18, fontWeight: "bold", margin: 2.5 }} >Map</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={CalendarStyle.todayBTN}
            onPress={() => {
              const today = new Date();
              calendarRef.current?.goToDate({ date: today, animatedDate: true });
              setCurrentDate(today)
            }}
          >
            <MaterialIcons name="today" size={24} color="white" />
            <Text style={{ color: "white", fontWeight: "bold", margin: 2.5 }} >TODAY</Text>
          </TouchableOpacity>

          <RightDrawer setChosenCalendar={setChosenCalendar} open={open || false} />
        </View>

        <View style={CalendarStyle.headerCalendarButtonsContainer} >
          <TouchableOpacity onPress={() => { handleWeekChange(-7) }} >
            <Feather name="chevron-left" size={30} color="black" />
          </TouchableOpacity>

          <Text style={{ paddingLeft: 10, marginTop: 5 }} >{currentWeek(currentDate)}</Text>

          <TouchableOpacity onPress={() => { handleWeekChange(7) }} >
            <Feather name="chevron-right" size={30} color="black" />
          </TouchableOpacity>
        </View>

        {/* Renders the calendar view */}
        <CalendarContainer
          theme={{ todayNumberContainer: {backgroundColor: '#E09F3E'}, nowIndicatorColor: '#E09F3E' }}
          ref={calendarRef}
          events={events}
          initialDate={currentDate.toISOString()}
          onDateChanged={(date) => {
            setCurrentDate(new Date(date));
          }}
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
                <Button title="Cancel 2" onPress={() => { setModalVisible(false);}} />
              </View>
              <Button title="Cancel 3" onPress={() => { setModalVisible(false); }} />
            </View>
          </View>
        </Modal>
      </View>
    </ClassEventsProvider>
  );
};



export default CalendarScreen;
