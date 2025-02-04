import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Map from './components/Map';

export default function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://10.0.2.2:3000')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <View style={styles.container}>
      <Map />
      <Text>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
