import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import Map from '../src/components/Map'; // Adjust the import path based on your file structure
import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps';

// Mock the necessary modules
jest.mock('@rnmapbox/maps', () => {
  return {
    MapView: 'MapView', // Mock MapView component
    Camera: 'Camera', // Mock Camera component
    PointAnnotation: 'PointAnnotation', // Mock PointAnnotation component
    setAccessToken: jest.fn(),
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

describe('Map Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    render(<Map />);

    // Check if MapView is rendered
    expect(screen.getByTestId('map-view')).toBeTruthy();

    // Check if the current location button is rendered
    expect(screen.getByTestId('current-location-button')).toBeTruthy();
  });

  it('requests location permission on mount', async () => {
    // Mock successful permission response
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    render(<Map />);

    // Check if location permission is requested
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('handles location retrieval successfully', async () => {
    // Mock successful location retrieval
    const mockLocation = {
      coords: {
        latitude: 45.4949968855897,
        longitude: -73.57794614197633,
      },
    };
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

    render(<Map />);

    // Wait for the location to be set
    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toBeTruthy();
    });
  });

  it('focuses on the user location when button is pressed', async () => {
    // Mock successful location retrieval
    const mockLocation = {
      coords: {
        latitude: 45.4949968855897,
        longitude: -73.57794614197633,
      },
    };
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

    render(<Map />);

    // Wait for the location to be set
    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toBeTruthy();
    });

    // Press the focus button and check if camera movement is triggered
    const button = screen.getByTestId('current-location-button');
    fireEvent.press(button);

    // Assuming camera focus happens inside `focusOnLocation`
    // Test for a side effect, for example:
    expect(Mapbox.Camera.setCamera).toHaveBeenCalled();
  });
});
