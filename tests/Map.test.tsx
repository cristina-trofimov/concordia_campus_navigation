import React, { useEffect, useRef, useState } from 'react';
import { render } from '@testing-library/react-native';
import Map from '../src/components/Map'; // Update the import path
import { Dimensions, StyleSheet, View, Image, TouchableOpacity, Platform } from 'react-native';
import * as Location from 'expo-location';
import Mapbox, { Camera, MapView, PointAnnotation, MarkerView } from '@rnmapbox/maps';
import { Text } from '@rneui/themed';
import { locations } from '../src/data/buildingLocation.ts'
import ToggleButton from '../src/components/ToggleButton';
import { HighlightBuilding } from '../src/components/BuildingCoordinates';



// In your test file, mock Platform.OS just for this test
jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    ...actualReactNative,
    Platform: {
      ...actualReactNative.Platform,
      OS: 'ios',  // or 'android'
    },
  };
});

jest.mock('@rneui/themed', () => {
  return {
    Text: 'Text',  // Mock Text as a simple placeholder
  };
});


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
            width: 100,
            height: 100,
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
          annotationImage: {
            width: 30,
            height: 30,
          },
          toggleButtonContainer: {
            position: 'absolute',
            top: 20,
            alignItems: 'center',
          },
          marker: {
            alignItems: 'center',
            justifyContent: 'center',
          },
          markerText: {
            fontSize: 24,
          },
          callout: {
            padding: 10,
            backgroundColor: 'white',
            borderRadius: 5,
            width: 150,
          },
          calloutTitle: {
            fontWeight: 'bold',
            fontSize: 16,
          },
          calloutDescription: {
            fontSize: 14,
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


describe('Map Component', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<Map />);
    const mapView = getByTestId('map'); // Set testID in your component if not present
    expect(mapView).toBeTruthy();
  });
});

test('Check app start and map renders', () => {
  const { getByTestId } = render(<Map />);
  expect(getByTestId('map-view')).toBeTruthy();
  expect(getByTestId('button-container')).toBeTruthy();
});

test('Check location button renders', () => {
  const { getByTestId } = render(<Map />);
  expect(getByTestId('location-button')).toBeTruthy();
  expect(getByTestId('location-button-image')).toBeTruthy();
});

test('Focus on location button triggers camera movement', async () => {
  const { getByTestId } = render(<Map />);
  const focusButton = getByTestId('location-button');

  // Simulate the press on the location button
  fireEvent.press(focusButton);

  // You can add a mock to check if the camera was focused, e.g., by checking setCamera method being called
  await waitFor(() => {
    // Assuming your setCamera mock is called in the function, check if it's been called
    expect(cameraRef.current.setCamera).toHaveBeenCalled();
  });
});

test('Renders user location marker when location is available', async () => {
  const { getByTestId } = render(<Map />);
  await waitFor(() => {
    const marker = getByTestId('user-location-point');
    expect(marker).toBeTruthy();
  });
});

describe('Map Component', () => {
  const sgwCoords = { latitude: 45.4949968855897, longitude: -73.57794614197633 };

  it('should render correctly', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.4949968855897, longitude: -73.57794614197633 },
    });

    const { getByTestId } = render(<Map />);

    // Wait for the map to load and check camera setting
    await waitFor(() => getByTestId('map-view'));

    // Verify if the map and button container are rendered correctly
    expect(getByTestId('map-view')).toBeTruthy();
    expect(getByTestId('button-container')).toBeTruthy();
  });

  it('should set camera to SGW on mount', async () => {
    const setCameraMock = jest.fn();
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.4949968855897, longitude: -73.57794614197633 },
    });

    const { getByTestId } = render(<Map />);

    await waitFor(() => getByTestId('map-view'));

    // Simulate the camera's setCamera function call
    expect(setCameraMock).toHaveBeenCalledWith({
      centerCoordinate: [sgwCoords.longitude, sgwCoords.latitude],
      zoomLevel: 17,
      animationMode: 'flyTo',
      animationDuration: 1000,
    });
  });

  it('should show user location marker when location is available', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.4949968855897, longitude: -73.57794614197633 },
    });

    const { getByTestId } = render(<Map />);

    await waitFor(() => getByTestId('map-view'));

    // Expect that user location marker is rendered
    expect(getByTestId('user-location-point')).toBeTruthy();
  });

  it('should focus on user location when button is pressed', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.4949968855897, longitude: -73.57794614197633 },
    });

    const { getByTestId } = render(<Map />);
    const locationButton = getByTestId('location-button');

    // Simulate a button press to focus on user location
    fireEvent.press(locationButton);

    // Check if the focus on location function is called (mocking `setCamera` method)
    expect(mockSetCamera).toHaveBeenCalledWith({
      centerCoordinate: [45.4949968855897, -73.57794614197633],
      zoomLevel: 17,
      animationMode: 'flyTo',
      animationDuration: 1000,
    });
  });
});