import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window'); // Get screen dimensions

const MyModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  const handleClose = () => {
    setInputValue('');
    onClose(); // Close the modal
  };

  return (
    <Modal
      visible={visible}
      animationType="fade" // Smooth transition
      transparent={true}
      onRequestClose={handleClose} // Close the modal when the back button is pressed
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enter some text</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Type something..."
            value={inputValue}
            onChangeText={handleInputChange}
          />
          <TouchableOpacity style={styles.buttonContainer} onPress={handleClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim background
    width: width * 0.8, // Set modal width to 80% of screen width
    maxHeight: height * 0.8, // Set max height to 60% of screen height
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: width * 0.8, // Set modal width to 80% of screen width
    maxHeight: height * 0.6, // Set max height to 60% of screen height
    alignItems: 'center',
    elevation: 5, // Shadow for Android devices
    justifyContent: 'space-between', // Ensure content is spaced out correctly
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 10,
    backgroundColor: '#007bff', // Button background color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MyModal;
