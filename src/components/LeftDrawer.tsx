import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Modal, View, Animated, Dimensions, GestureResponderEvent, Text, } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LeftDrawerStyle } from "../styles/LeftDrawerStyle";
import firebase from './src/components/firebase';
import analytics from '@react-native-firebase/analytics';



const { width } = Dimensions.get("window");
// timer for usabilty test
let startTime = 0;
let timerInterval: any = null;
(globalThis as any).taskTimer = {
  start: () => {
    if (startTime === 0) {  // Only start a new timer if no timer is running
      startTime = Date.now(); // Record the start time
      console.log("Timer started");
    } else {
      console.log("Timer already running, resetting.");
      startTime = Date.now(); // Reset the timer
    }
  },
  stop: () => {
    if (startTime !== 0) {
      const elapsedTime = Date.now() - startTime;
      console.log(`Timer stopped. Time elapsed: ${(elapsedTime / 1000).toFixed(2)} seconds`);
      // Reset the timer after stopping
      startTime = 0;
      return elapsedTime; // Return the time taken
    }
    console.log("No Timer running currently");
    return 0;
  },
  getElapsedTime: () => {
    if (startTime === 0) return 0;
    return Date.now() - startTime;
  },
  isStarted: () =>{
    if (startTime === 0) return false;
    else return true;
      }

};

const LeftDrawer = () => {
  const [isTesting, setIsTesting] = useState((globalThis as any).isTesting);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

  const handleOverlayPress = (event: GestureResponderEvent) => {
    if (event.target === event.currentTarget) {
      setIsDrawerVisible(false);
    }
  };
  const handleStartTask = () => {
    // Start or reset the timer
    (globalThis as any).taskTimer.start();

    // Log the "start_task" event with Firebase Analytics
    analytics().logEvent('start_task', {
      message: 'Started a task',
      user_id: (globalThis as any).userId,
    });

    console.log("Start Task pressed");
  };

  const handleCancelTask = () => {
    // Stop the timer and log the time elapsed
    const elapsedTime = (globalThis as any).taskTimer.stop();
    if(elapsedTime!=0){
    // Log the "cancel_task" event with Firebase Analytics
    analytics().logEvent('cancel_task', {
      message: 'Cancelled a task',
      user_id: (globalThis as any).userId,
    });}

    console.log("Cancel Task pressed");
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
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isDrawerVisible, slideAnim]);

  return (
    <View style={LeftDrawerStyle.container} >
      <View style={{ flex: 1 }}>
      {/* Button */}
      <TouchableOpacity style={LeftDrawerStyle.button} onPress={ () => { setIsDrawerVisible(!isDrawerVisible); } } >
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
          style={LeftDrawerStyle.overlay}
          onPress={handleOverlayPress}
          activeOpacity={1}
        >
          <Animated.View
            style={[LeftDrawerStyle.drawer, { transform: [{ translateX: slideAnim }] }]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Content */}
              <View style={LeftDrawerStyle.contentContainer} >
                {/* <HandleGoogle /> */}

                <TouchableOpacity onPress={ () => { console.log("your favorites was presses") } } >
                  <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                    <Feather name="heart" size={20} color="black" style={LeftDrawerStyle.contentImage} />
                    <Text style={{ fontWeight: "bold" }} >Your Favorites</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={ () => { console.log("your timeline was presses") } } >
                  <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                    <Ionicons name="analytics-outline" size={20} color="black" style={LeftDrawerStyle.contentImage} />
                    <Text style={{ fontWeight: "bold" }} >Your Timeline</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={ () => { console.log("help & feedback was presses") } } >
                  <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                    <Feather name="help-circle" size={20} color="black" style={LeftDrawerStyle.contentImage} />
                    <Text style={{ fontWeight: "bold" }} >Help & Feedback</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={ () => { console.log("settings was presses") } } >
                  <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                    <Feather name="settings" size={20} color="black" style={LeftDrawerStyle.contentImage} />
                    <Text style={{ fontWeight: "bold" }} >Settings</Text>
                  </View>
                </TouchableOpacity>
                {(globalThis as any).isTesting && (
                    <>
                    {/* Start Task Button */}
                        <TouchableOpacity onPress={handleStartTask}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 300 }}>
                                <Feather name="play" size={20} color="black" style={LeftDrawerStyle.contentImage} />
                                <Text style={{ fontWeight: "bold" }}>Start Task</Text>
                            </View>
                        </TouchableOpacity>

                    {/* Cancel Task Button */}
                        <TouchableOpacity onPress={handleCancelTask}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                <Feather name="x" size={20} color="black" style={LeftDrawerStyle.contentImage} />
                                <Text style={{ fontWeight: "bold" }}>Cancel Task</Text>
                            </View>
                        </TouchableOpacity>
                </>
                )}
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



export default LeftDrawer;
