// At the very top of your Map.test.tsx file
jest.mock('../src/components/ShuttleBusTracker.tsx', () => 'ShuttleBusTracker', { virtual: true });

import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';

jest.mock('../src/components/BuildingCoordinates', () => ({
  HighlightBuilding: (props) => {
    // Simple mock implementation that doesn't call setIsInsideBuilding
    return null;
  }
}));

jest.mock('../src/data/CoordsContext.tsx', () => ({
  useCoords: jest.fn().mockReturnValue({
    routeData: [],
    setmyLocationString: jest.fn(),
    myLocationString: '',
    setIsInsideBuilding: jest.fn(), // Add this function
    isInsideBuilding: false         // Add this state value
  })
}));

// Add this mock if there's a separate BuildingContext
jest.mock('../src/data/CoordsContext.tsx', () => ({
  useBuildingContext: jest.fn().mockReturnValue({
    setIsInsideBuilding: jest.fn(),
    isInsideBuilding: false
  })
}));

import Map from '../src/components/Map.tsx';
import * as Location from 'expo-location';

// Mock all external dependencies
jest.mock('@rnmapbox/maps', () => {
  return {
    setAccessToken: jest.fn(),
    MapView: 'MapView',
    Camera: 'Camera',
    PointAnnotation: 'PointAnnotation',
    ShapeSource: 'ShapeSource',
    LineLayer: 'LineLayer'
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: { High: 'high' }
}));

jest.mock('../src/data/CoordsContext.tsx', () => ({
  useCoords: jest.fn().mockReturnValue({
    routeData: [],
    setmyLocationString: jest.fn(),
    myLocationString: ''
  })
}));

jest.mock('../src/components/BuildingInformation.tsx', () => 'BuildingInformation');
jest.mock('../src/components/ToggleButton', () => 'ToggleButton');

// Mock native modules and timers
jest.useFakeTimers();

describe('Map Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock location permissions and position
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.49, longitude: -73.57 }
    });
    Location.watchPositionAsync.mockReturnValue(Promise.resolve({
      remove: jest.fn()
    }));
  });

  test('renders without crashing', () => {
    const drawerHeight = new Animated.Value(0);
    const { toJSON } = render(<Map drawerHeight={drawerHeight} />);
    
    expect(toJSON()).toBeTruthy();
  });

  test('requests location permissions on mount', () => {
    const drawerHeight = new Animated.Value(0);
    render(<Map drawerHeight={drawerHeight} />);
    
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  test('gets current position on mount', () => {
    const drawerHeight = new Animated.Value(0);
    render(<Map drawerHeight={drawerHeight} />);
    
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
  });

  test('sets up location watching on mount', () => {
    const drawerHeight = new Animated.Value(0);
    render(<Map drawerHeight={drawerHeight} />);
    
    expect(Location.watchPositionAsync).toHaveBeenCalledWith(
      {
        accuracy: 'high',
        timeInterval: 10000,
        distanceInterval: 1,
      },
      expect.any(Function)
    );
  });

  test('renders BuildingInformation component', () => {
    const drawerHeight = new Animated.Value(0);
    const { getByText } = render(<Map drawerHeight={drawerHeight} />);
    
    // Since we've mocked BuildingInformation as a string, we can check for its presence
    expect(() => getByText('BuildingInformation')).not.toThrow();
  });

  test('renders ToggleButton component', () => {
    const drawerHeight = new Animated.Value(0);
    const { getByText } = render(<Map drawerHeight={drawerHeight} />);
    
    // Since we've mocked ToggleButton as a string, we can check for its presence
    expect(() => getByText('ToggleButton')).not.toThrow();
  });
});