import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

const LeftDrawer = ({ isVisible, onClose, content }) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.drawer}>
          <TouchableOpacity activeOpacity={1}>{content}</TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  drawer: {
    width: "80%",
    height: "100%",
    backgroundColor: "white",
    padding: 20,
  },
});

export default LeftDrawer;
