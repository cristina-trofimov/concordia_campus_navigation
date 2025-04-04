import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Modal, View, Animated, Dimensions, GestureResponderEvent, Button, Text, } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { RightDrawerStyle } from "../styles/RightDrawerStyle";
import { signOut } from "./HandleGoogle";
import { Calendar } from "../interfaces/calendar";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CalendarScreenProp, RootStackParamList } from "../../App";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");

const RightDrawer = ({setChosenCalendar} : {setChosenCalendar : (calendar : Calendar) => void}) => {
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const route = useRoute<CalendarScreenProp>();
    const calendars = route.params?.calendars;
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const slideAnim = useRef(new Animated.Value(width)).current;

    const handleSignOut = () => {
        signOut().then(() => { setIsDrawerVisible(false); navigation.navigate("Home") });
    };

    const handleOverlayPress = (event: GestureResponderEvent) => {
        if (event.target === event.currentTarget) {
            setIsDrawerVisible(false);
        }
    };

    useEffect(() => {
        if (isDrawerVisible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: width,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isDrawerVisible, slideAnim]);

    return (
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {/* Button */}
            <TouchableOpacity style={RightDrawerStyle.button} onPress={() => { setIsDrawerVisible(!isDrawerVisible); }} >
                <Ionicons name="reorder-three-outline" size={40} color="black" />
            </TouchableOpacity>

            {/* Drawer */}
            <Modal
                transparent={true}
                visible={isDrawerVisible}
                animationType="none"
                onRequestClose={handleOverlayPress}
            >
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        style={RightDrawerStyle.overlay}
                        onPress={handleOverlayPress}
                        activeOpacity={1}
                    >
                        <Animated.View
                            style={[
                                RightDrawerStyle.drawer,
                                {
                                    transform: [{ translateX: slideAnim }],
                                    right: 0,
                                }
                            ]}
                        >
                            <TouchableOpacity activeOpacity={1}>
                                {/* Content */}
                                <View style={RightDrawerStyle.contentContainer} >
                                    {/* Calendar choice component  */}
                                    <View>
                                        {calendars?.map((calendar) => {
                                            return (
                                                <TouchableOpacity key={calendar.id} onPress={() => { setChosenCalendar(calendar); AsyncStorage.setItem("chosenCalendar", JSON.stringify(calendar)) }} >
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} >
                                                        <Ionicons name="calendar-outline" size={24} color="black" />
                                                        <Text>{calendar.title}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        })
                                        }
                                    </View>

                                    <View style={RightDrawerStyle.signInButtonView}>
                                        <Button color={"#912338"} title="Sign Out" onPress={handleSignOut} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default RightDrawer;
