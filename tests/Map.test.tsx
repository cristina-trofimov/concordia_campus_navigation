// At the very top of your Map.test.tsx file
jest.mock('@env', () => ({
  MAPBOX_TOKEN: 'mock-token'
}));

// Mock components and modules before imports
jest.mock('../src/data/CoordsContext.tsx', () => ({
  useCoords: jest.fn().mockReturnValue({
    routeData: [],
    setmyLocationString: jest.fn(),
    myLocationString: '',
  }),
}));

jest.mock('@mapbox/polyline', () => ({
  decode: jest.fn().mockReturnValue([])
}));

jest.mock('../src/components/ShuttleBusTracker.tsx', () => 'ShuttleBusTracker');
jest.mock('../src/components/BuildingCoordinates', () => ({
  HighlightBuilding: () => null
}));

// Import React and testing utilities
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';

// Mock Mapbox components
jest.mock('@rnmapbox/maps', () => {
  const React = require('react');
  
  return {
    setAccessToken: jest.fn(),
    MapView: jest.fn(({ children, onDidFinishLoadingMap, testID }) => {
      React.useEffect(() => {
        if (onDidFinishLoadingMap) {
          onDidFinishLoadingMap();
        }
      }, []);
      return <div data-testid="mapview" testID="mapview">{children}</div>;
    }),
    Camera: jest.fn(({ children, ref }) => {
      React.useEffect(() => {
        if (ref) {
          ref({
            setCamera: jest.fn()
          });
        }
      }, []);
      return <div data-testid="camera">{children}</div>;
    }),
    PointAnnotation: jest.fn(({ children }) => <div>{children}</div>),
    ShapeSource: jest.fn(({ children }) => <div>{children}</div>),
    LineLayer: jest.fn(() => <div />)
  };
});

// Mock expo-location
jest.mock('expo-location', () => {
  return {
    requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getCurrentPositionAsync: jest.fn().mockResolvedValue({
      coords: { latitude: 45.49, longitude: -73.57 }
    }),
    watchPositionAsync: jest.fn().mockImplementation((_, callback) => {
      callback({ coords: { latitude: 45.49, longitude: -73.57 } });
      return Promise.resolve({
        remove: jest.fn()
      });
    }),
    Accuracy: { High: 'high' }
  };
});

// Mock your components
jest.mock('../src/components/BuildingInformation.tsx', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="building-information" />)
  };
});

jest.mock('../src/components/ToggleButton', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="toggle-button" />)
  };
});

// Import the component under test
import Map from '../src/components/Map.tsx';

// Setup tests
describe('Map Component', () => {
  // Use fake timers
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('renders without crashing', async () => {
    const drawerHeight = new Animated.Value(0);
    const { getByTestId } = render(<Map drawerHeight={drawerHeight} />);
    
    // Advance timers and wait for all promises
    jest.advanceTimersByTime(2000);
    await waitFor(() => expect(getByTestId('mapview')).toBeTruthy());
  });

  // Additional tests follow the same pattern...
});