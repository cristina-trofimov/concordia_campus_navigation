import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My React Native Expo App!</Text>
      <Text>{message}</Text>
    </View>
  );
}

