import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Image, StyleSheet, Modal, View, Animated, Dimensions, GestureResponderEvent, Text, } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';


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
    <View style={styles.container} >
      <View style={{ flex: 1 }}>
      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={ () => { setIsDrawerVisible(!isDrawerVisible); } } >
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
          style={styles.overlay}
          onPress={handleOverlayPress}
          activeOpacity={1}
        >
          <Animated.View
            style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Content */}
              <View style={styles.contentContainer} >
                {/* <HandleGoogle /> */}

                <TouchableOpacity onPress={ () => { console.log("your favorites was presses") } } >
                  <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                    <Feather name="heart" size={20} color="black" style={styles.contentImage} />
                    <Text style={{ fontWeight: "bold" }} >Your Favorites</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={ () => { console.log("your timeline was presses") } } >
                  <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                    <Ionicons name="analytics-outline" size={20} color="black" style={styles.contentImage} />
                    <Text style={{ fontWeight: "bold" }} >Your Timeline</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={ () => { console.log("help & feedback was presses") } } >
                  <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                    <Feather name="help-circle" size={20} color="black" style={styles.contentImage} />
                    <Text style={{ fontWeight: "bold" }} >Help & Feedback</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={ () => { console.log("settings was presses") } } >
                  <View style={{ flexDirection: 'row', alignItems: 'center', }} >
                    <Feather name="settings" size={20} color="black" style={styles.contentImage} />
                    <Text style={{ fontWeight: "bold" }} >Settings</Text>
                  </View>
                </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    alignItems: 'center',
  },
  button: {
    position: "absolute",
    top: 10,
    left: 10,
    height: 40,
    width: 40,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 5,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    zIndex: 1,
  },
  image: {
    margin: 5,
    height: 30,
    width: 30,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  drawer: {
    width: "70%",
    height: "100%",
    backgroundColor: "white",
    padding: 20,
  },
  contentContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
    padding: 10,
    marginTop: 20,
  },
  contentImage: {
    height: 20,
    width: 20,
    marginRight: 10,
  },
});

export default LeftDrawer;
