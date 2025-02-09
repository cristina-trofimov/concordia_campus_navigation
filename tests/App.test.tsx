//import 'react-native';
import React from 'react';
import App from '../App';
import {render, fireEvent} from '@testing-library/react-native'
import { Dimensions, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import Mapbox, { Camera, MarkerView } from '@rnmapbox/maps';
import * as Location from 'expo-location';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 45.4949968855897,
      longitude: -73.57794614197633,
    },
  }),
}));


jest.mock('react-native', () => {
    const actualReactNative = jest.requireActual('react-native');
  return {
      Image: {
            uri: 'test-uri'
          },
    StyleSheet: {
      create: () => ({
        container: {
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
        },
        map: {
          width: 400,  // Example value, you can adjust as needed
          height: 600, // Example value, you can adjust as needed
        },
        buttonContainer: {
          position: 'absolute',
          bottom: 20,
          right: 20,
          alignItems: 'center',
        },
        buttonImage: {
          width: 50,
          height: 50,
          resizeMode: 'contain',
        },
        imageButton: {
          padding: 10,
          backgroundColor: 'transparent',
          borderRadius: 25,
        },
      }),
    },
    Dimensions: {
      get: () => ({
        window: {
          width: 400,  // Example value for window width
          height: 600, // Example value for window height
        },
      }),
    },
  };
});





jest.mock('@rnmapbox/maps', () => ({
  MapView: 'MapView',  // You can mock the component or return a simple placeholder
  Camera: 'Camera',  // You can mock the Camera component or return a placeholder
  PointAnnotation: 'PointAnnotation',  // Same for PointAnnotation
  setAccessToken: jest.fn(),  // Mocking the setAccessToken method
}));

jest.mock('@rneui/themed', () => ({
  Button: jest.fn(() => <div>Mocked Button</div>),  // Mock Button component
  ThemeProvider: jest.fn(({ children }) => <div>{children}</div>),  // Mock ThemeProvider to render children directly
  createTheme: jest.fn(() => ({ colors: { primary: 'blue' } })),  // Mock createTheme to return a simple theme object
}));

test('Check app start', () => {
  const { getByText } = render(<App />);
  expect(getByTextID('Image')).toBeTruthy();
});