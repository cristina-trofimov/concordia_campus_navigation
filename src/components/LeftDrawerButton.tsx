import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, Image, StyleSheet, Modal, View, Animated, Dimensions, GestureResponderEvent, } from "react-native";
import LeftDrawerContent from "./LeftDrawerContent";

const { width } = Dimensions.get("window");

const LeftDrawerButton = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerVisible(!isDrawerVisible);
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.button} onPress={toggleDrawer}>
        <Image
          source={require("../../src/resources/images/icons8-menu.png")}
          style={styles.image}
        />
      </TouchableOpacity>
      <LeftDrawer
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        content={<LeftDrawerContent />}
      />
    </View>
  );
};

const LeftDrawer = ({
  isVisible,
  onClose,
  content,
}: {
  isVisible: boolean;
  onClose: () => void;
  content: React.ReactNode;
}) => {
  const slideAnim = useRef(new Animated.Value(-width)).current;

  const handleOverlayPress = (event: GestureResponderEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible) {
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
  }, [isVisible, slideAnim]);

  return (
    <Modal
      transparent={true}
      visible={isVisible}
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
            <TouchableOpacity activeOpacity={1}>{content}</TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default LeftDrawerButton;
