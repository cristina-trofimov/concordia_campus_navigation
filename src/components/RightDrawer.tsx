import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Modal, View, Animated, Dimensions, GestureResponderEvent, Button, Text, } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RightDrawerStyle } from "../styles/RightDrawerStyle";
import { signIn } from "./signin";
import { fetchUserCalendars } from "./googleCalendarFetching";
import { signOut } from "./signout";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { Calendar } from "../interfaces/calendar";

const { width } = Dimensions.get("window");

const RightDrawer = ({setChosenCalendar} : {setChosenCalendar : (calendar : Calendar) => void}) => {
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [calendars, setCalendars] = useState<Calendar[] | undefined>([]);


    const slideAnim = useRef(new Animated.Value(width)).current;

    const handleSignIn = async () => {
        const token = await signIn();
        if (token) {
            // fetchCalendarEvents(token);
            const calendars = await fetchUserCalendars(token);
            if (calendars) {
                setCalendars(calendars.data?.calendars);
            }
            console.log(calendars.data?.calendars);
            setIsSignedIn(true);
        };

    }

    const handleSignOut = () => {
        signOut().then(() => setIsSignedIn(false));
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
        <View style={RightDrawerStyle.container} >
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
                                        right: 0, // Position the drawer on the right side
                                    }
                                ]}
                            >
                                <TouchableOpacity activeOpacity={1}>
                                    {/* Content */}
                                    <View style={RightDrawerStyle.contentContainer} >
                                        {/* Calendar choice component  */}
                                        <View>
                                            {isSignedIn && calendars && (
                                                calendars.map((calendar) => {
                                                    return (
                                                        <TouchableOpacity key={calendar.id} onPress={() => setChosenCalendar(calendar)} >
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} >
                                                                <Ionicons name="calendar-outline" size={24} color="black" />
                                                                <Text>{calendar.title}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    )
                                                })
                                            )}
                                        </View>

                                        <View style={RightDrawerStyle.signInButtonView}>
                                            {!isSignedIn ? (
                                                <GoogleSigninButton
                                                    size={GoogleSigninButton.Size.Standard}
                                                    color={GoogleSigninButton.Color.Dark}
                                                    onPress={handleSignIn}
                                                />
                                            ) : (
                                                <Button title="Sign Out" onPress={handleSignOut} />
                                            )}
                                        </View>



                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

export default RightDrawer;
