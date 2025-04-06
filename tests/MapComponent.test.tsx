// Mock all dependencies before imports

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

jest.mock('@rnmapbox/maps', () => {
  const React = require('react');
  return {
    MapView: React.forwardRef((props, ref) => {
      // Call onDidFinishLoadingMap if provided
      if (props.onDidFinishLoadingMap) {
        setTimeout(props.onDidFinishLoadingMap, 0);
      }
      return null;
    }),
    Camera: jest.fn().mockImplementation(() => null),
    PointAnnotation: jest.fn().mockImplementation(() => null),
    ShapeSource: jest.fn().mockImplementation(() => null),
    LineLayer: jest.fn().mockImplementation(() => null),
    setAccessToken: jest.fn(),
  };
});

jest.mock('@mapbox/polyline', () => ({
  decode: jest.fn().mockReturnValue([[45.495, -73.577], [45.496, -73.578]]),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 45.495,
      longitude: -73.577,
    },
  }),
  watchPositionAsync: jest.fn().mockReturnValue(Promise.resolve({ remove: jest.fn() })),
  Accuracy: { High: 'high' },
}));

// Mock all components used by MapComponent
jest.mock('../src/data/CoordsContext', () => ({
  useCoords: jest.fn().mockReturnValue({
    routeData: [],
    setmyLocationString: jest.fn(),
    myLocationCoords: null,
    setMyLocationCoords: jest.fn(),
  }),
}));

jest.mock('../src/data/IndoorContext', () => ({
  useIndoor: jest.fn().mockReturnValue({
    inFloorView: false,
  }),
}));
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
}));
jest.mock('../src/components/BuildingCoordinates', () => ({
  HighlightBuilding: jest.fn().mockImplementation(() => null),
}));

jest.mock('../src/components/IndoorMap', () => ({
  HighlightIndoorMap: jest.fn().mockImplementation(() => null),
}));

jest.mock('../src/components/ShuttleBusTracker', () => jest.fn().mockImplementation(() => null));
jest.mock('../src/components/ToggleButton', () => jest.fn().mockImplementation(() => null));
jest.mock('../src/components/BuildingInformation', () => jest.fn().mockImplementation(() => null));

// Suppress console.log during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Now after all mocks are set up, import React and testing libraries
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';
import * as Location from 'expo-location';
import { useCoords } from '../src/data/CoordsContext';

// Import the component to test
import MapComponent from '../src/components/MapComponent';

describe('MapComponent', () => {
  const mockSetInputDestination = jest.fn();
  const mockAnimatedValue = new Animated.Value(100);
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination} 
      />
    );
  });

  test('requests location permissions on mount', async () => {
    // First wait for the mocked promises to resolve
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination} 
      />
    );
    
    // Then check if the permissions were requested
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
    });
  });

  test('handles location permission denial', async () => {
    // Mock location permission denial
    Location.requestForegroundPermissionsAsync.mockImplementationOnce(() => 
      Promise.resolve({ status: 'denied' })
    );
    
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination} 
      />
    );
    
    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith('Permission to access location was denied');
    });
    
    consoleWarnSpy.mockRestore();
  });

  test('processes route data when available', async () => {
    // Setup route data
    const mockPolyline = require('@mapbox/polyline');
    const mockRouteData = [{
      overview_polyline: {
        points: "mock_polyline_string"
      },
      legs: [
        {
          steps: [
            {
              travel_mode: "WALKING",
              polyline: {
                points: "mock_polyline_string"
              }
            }
          ]
        }
      ]
    }];
    
    // Mock the useCoords hook to return route data
    (useCoords as jest.Mock).mockReturnValueOnce({
      routeData: mockRouteData,
      setmyLocationString: jest.fn(),
      myLocationCoords: { latitude: 45.495, longitude: -73.577 },
      setMyLocationCoords: jest.fn()
    });
    
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination} 
      />
    );
    
    await waitFor(() => {
      expect(mockPolyline.decode).toHaveBeenCalledWith("mock_polyline_string");
    }, { timeout: 3000 });
  });
});