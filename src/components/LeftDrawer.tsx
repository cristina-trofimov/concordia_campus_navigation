import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Modal, View, Animated, Dimensions, GestureResponderEvent, Text, } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LeftDrawerStyle } from "../styles/LeftDrawerStyle";


const { width } = Dimensions.get("window");

const LeftDrawer = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;

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
                    <TouchableOpacity onPress={() => { console.log("Start Task pressed") }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 300 }}>
                           <Feather name="play" size={20} color="black" style={LeftDrawerStyle.contentImage} />
                           <Text style={{ fontWeight: "bold" }}>Start Task</Text>
                        </View>
                    </TouchableOpacity>
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
