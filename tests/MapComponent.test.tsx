// Mock all dependencies before imports

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

jest.mock('@rnmapbox/maps', () => {
  const React = require('react');
  return {
    MapView: React.forwardRef((props, ref) => {
      // Call onDidFinishLoadingMap if provided
      if (props.onDidFinishLoadingMap) {
        setTimeout(() => {
          props.onDidFinishLoadingMap();
          if (ref) {
            if (typeof ref === 'function') {
              ref({ setCamera: jest.fn() });
            } else {
              ref.current = { setCamera: jest.fn() };
            }
          }
        }, 0);
      }
      return React.createElement('div', null, props.children);
    }),
    Camera: React.forwardRef((props, ref) => {
      if (ref) {
        if (typeof ref === 'function') {
          ref({ setCamera: jest.fn() });
        } else {
          ref.current = { setCamera: jest.fn() };
        }
      }
      return null;
    }),
    PointAnnotation: jest.fn(({ children, onSelected }) => {
      return React.createElement('div', { onClick: onSelected }, children);
    }),
    ShapeSource: jest.fn(({ children }) => React.createElement('div', null, children)),
    LineLayer: jest.fn(() => null),
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
const mockSetmyLocationString = jest.fn();
const mockSetMyLocationCoords = jest.fn();

jest.mock('../src/data/CoordsContext', () => ({
  useCoords: jest.fn().mockReturnValue({
    routeData: [],
    setmyLocationString: mockSetmyLocationString,
    myLocationCoords: { latitude: 45.495, longitude: -73.577 },
    setMyLocationCoords: mockSetMyLocationCoords,
  }),
}));

const mockInFloorView = false;
jest.mock('../src/data/IndoorContext', () => ({
  useIndoor: jest.fn().mockReturnValue({
    inFloorView: mockInFloorView,
  }),
}));

const mockLogEvent = jest.fn();
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: mockLogEvent,
}));

jest.mock('../src/components/BuildingCoordinates', () => ({
  HighlightBuilding: jest.fn().mockImplementation(() => null),
}));

jest.mock('../src/components/IndoorMap', () => ({
  HighlightIndoorMap: jest.fn().mockImplementation(() => null),
}));

jest.mock('../src/components/ShuttleBusTracker', () => jest.fn().mockImplementation(() => null));
jest.mock('../src/components/ToggleButton', () => jest.fn(({ onCampusChange }) => (
  <div data-testid="toggle-button" onClick={() => onCampusChange(false)}>Toggle</div>
)));

jest.mock('../src/components/BuildingInformation', () => 
  jest.fn(({ isVisible, onClose, buildingLocation, setInputDestination, setInputOrigin }) => (
    isVisible ? (
      <div data-testid="building-info">
        <button data-testid="close-overlay" onClick={onClose}>Close</button>
        <button 
          data-testid="set-destination" 
          onClick={() => setInputDestination(buildingLocation?.title || "")}
        >
          Set as Destination
        </button>
        <button 
          data-testid="set-origin" 
          onClick={() => setInputOrigin(buildingLocation?.title || "")}
        >
          Set as Origin
        </button>
      </div>
    ) : null
  ))
);

jest.mock('../src/components/Point-of-interest_Map', () => 
  jest.fn(() => <div data-testid="poi-map"></div>)
);

jest.mock('../src/data/buildingLocation.ts', () => ({
  locations: [
    {
      id: 1,
      title: 'Test Building',
      address: '123 Test St',
      coordinates: [-73.57, 45.49],
      floors: [],
    },
    {
      id: 2,
      title: 'Another Building',
      address: '456 Another St',
      coordinates: [-73.58, 45.48],
      floors: [],
    }
  ],
}));

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
import { render, waitFor, fireEvent, act } from '@testing-library/react-native';
import { Animated, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useCoords } from '../src/data/CoordsContext';
import { useIndoor } from '../src/data/IndoorContext';

// Import the component to test
import MapComponent from '../src/components/MapComponent';

describe('MapComponent', () => {
  const mockSetInputDestination = jest.fn();
  const mockSetInputOrigin = jest.fn();
  const mockAnimatedValue = new Animated.Value(100);
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the useCoords mock to default values
    (useCoords as jest.Mock).mockReturnValue({
      routeData: [],
      setmyLocationString: mockSetmyLocationString,
      myLocationCoords: { latitude: 45.495, longitude: -73.577 },
      setMyLocationCoords: mockSetMyLocationCoords,
    });
  });

  test('renders without crashing', () => {
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
  });

  test('requests location permissions on mount', async () => {
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
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
        setInputOrigin={mockSetInputOrigin}
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
            },
            {
              travel_mode: "TRANSIT",
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
      setmyLocationString: mockSetmyLocationString,
      myLocationCoords: { latitude: 45.495, longitude: -73.577 },
      setMyLocationCoords: mockSetMyLocationCoords
    });
    
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    await waitFor(() => {
      expect(mockPolyline.decode).toHaveBeenCalledWith("mock_polyline_string");
      // It should be called multiple times for each step in the route
      expect(mockPolyline.decode).toHaveBeenCalledTimes(2);
    });
  });

  test('does not render toggle button when in floor view', async () => {
    // Mock indoor context to show we are in floor view
    (useIndoor as jest.Mock).mockReturnValueOnce({
      inFloorView: true,
    });
    
    const { queryByTestId } = render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    await waitFor(() => {
      // Toggle button should not be rendered in floor view
      expect(queryByTestId('toggle-button')).toBeNull();
    });
  });

  test('handles error in route data processing', async () => {
    // Setup invalid route data to trigger error
    (useCoords as jest.Mock).mockReturnValueOnce({
      routeData: [{ invalid: 'data' }], // Will cause error during processing
      setmyLocationString: mockSetmyLocationString,
      myLocationCoords: { latitude: 45.495, longitude: -73.577 },
      setMyLocationCoords: mockSetMyLocationCoords
    });
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing route coordinates:', 
        expect.any(Error)
      );
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles different travel modes in route segments', async () => {
    // Setup route data with different travel modes
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
                points: "walking_polyline"
              }
            },
            {
              travel_mode: "TRANSIT",
              polyline: {
                points: "transit_polyline"
              }
            },
            {
              travel_mode: "DRIVING",
              polyline: {
                points: "driving_polyline"
              }
            },
            {
              travel_mode: "BICYCLING",
              polyline: {
                points: "bicycling_polyline"
              }
            }
          ]
        }
      ]
    }];
    
    const mockPolyline = require('@mapbox/polyline');
    // Set up different return values for different polylines
    mockPolyline.decode
      .mockReturnValueOnce([[45.495, -73.577], [45.496, -73.578]]) // walking
      .mockReturnValueOnce([[45.496, -73.578], [45.497, -73.579]]) // transit
      .mockReturnValueOnce([[45.497, -73.579], [45.498, -73.580]]) // driving
      .mockReturnValueOnce([[45.498, -73.580], [45.499, -73.581]]); // bicycling
    
    (useCoords as jest.Mock).mockReturnValueOnce({
      routeData: mockRouteData,
      setmyLocationString: mockSetmyLocationString,
      myLocationCoords: { latitude: 45.495, longitude: -73.577 },
      setMyLocationCoords: mockSetMyLocationCoords
    });
    
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    await waitFor(() => {
      expect(mockPolyline.decode).toHaveBeenCalledTimes(4);
      expect(mockPolyline.decode).toHaveBeenCalledWith("walking_polyline");
      expect(mockPolyline.decode).toHaveBeenCalledWith("transit_polyline");
      expect(mockPolyline.decode).toHaveBeenCalledWith("driving_polyline");
      expect(mockPolyline.decode).toHaveBeenCalledWith("bicycling_polyline");
    });
  });

  test('updates location string when myLocationCoords changes', async () => {
    render(
      <MapComponent 
        drawerHeight={mockAnimatedValue} 
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    await waitFor(() => {
      expect(mockSetmyLocationString).toHaveBeenCalledWith('45.495,-73.577');
    });
    
    // Now update the location
    act(() => {
      const locationWatchCallback = Location.watchPositionAsync.mock.calls[0][1];
      locationWatchCallback({ 
        coords: { latitude: 45.5, longitude: -73.6 }
      });
    });
    
    // The new location should be set
    expect(mockSetMyLocationCoords).toHaveBeenCalledWith({ 
      latitude: 45.5, longitude: -73.6 
    });
  });
});