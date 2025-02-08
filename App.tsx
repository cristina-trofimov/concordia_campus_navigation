import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button, ThemeProvider, createTheme } from '@rneui/themed';
import Map from './components/Map';

const theme = createTheme({
  lightColors: {
    primary: '#B52B20',
    secondary: '#D15329',
  },

  mode: 'light',
});

export default function App() {

  return (
    <View style={styles.container}>
      <Map />
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
