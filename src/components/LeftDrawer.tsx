import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Modal, View, Animated, Dimensions, GestureResponderEvent, Text, } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LeftDrawerStyle } from "../styles/LeftDrawerStyle";
import analytics from '@react-native-firebase/analytics';


const { width } = Dimensions.get("window");
// timer for usabilty test
let startTime = 0;
(globalThis as any).taskTimer = {
  start: () => {
    if (startTime === 0) {
      startTime = Date.now();
    } else {
      startTime = Date.now(); // Reset the timer
    }
  },
  stop: () => {
    if (startTime !== 0) {
      const elapsedTime = Date.now() - startTime;
      startTime = 0;
      return elapsedTime;
    }
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
      <TouchableOpacity
        testID="drawer-button"
        style={LeftDrawerStyle.button}
        onPress={ () => { setIsDrawerVisible(!isDrawerVisible); } }
      >
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
          testID="drawer-overlay"
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


                {(globalThis as any).isTesting && (
                    <>
                    {/* Start Task Button */}
                        <TouchableOpacity testID="start-task-button" onPress={handleStartTask}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 300 }}>
                                <Feather name="play" size={20} color="black" style={LeftDrawerStyle.contentImage} />
                                <Text style={{ fontWeight: "bold" }}>Start Task</Text>
                            </View>
                        </TouchableOpacity>

                    {/* Cancel Task Button */}
                        <TouchableOpacity testID="cancel-task-button" onPress={handleCancelTask}>
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