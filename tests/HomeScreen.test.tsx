import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../src/components/screens/HomeScreen';

// Mock all the imported components
jest.mock('../src/components/BottomDrawer', () => 'BottomDrawer');
jest.mock('../src/data/CoordsContext', () => ({
  CoordsProvider: ({ children }) => children,
}));
jest.mock('../src/data/IndoorContext', () => ({
  IndoorsProvider: ({ children }) => children,
}));
jest.mock('../src/components/CalendarButton', () => 'CalendarButton');
jest.mock('../src/components/FloorSelector', () => ({
  FloorSelector: 'FloorSelector',
}));
jest.mock('../src/components/SearchBars', () => 'SearchBars');
jest.mock('../src/components/DirectionsSteps', () => 'DirectionsSteps');
jest.mock('../src/components/MapComponent', () => 'MapComponent');
jest.mock('../src/components/Point-of-interest_Form', () => 'PointOfInterestSelector');
jest.mock('../src/components/RoomSearchBars', () => ({
  RoomSearchBars: 'RoomSearchBars',
}));

// Mock StyleSheet and other RN components properly
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.StyleSheet = {
    create: (styles) => styles,
  };
  rn.Animated = {
    Value: jest.fn(() => ({
      _value: 406, // half of mocked height
      interpolate: jest.fn(),
    })),
  };
  rn.Dimensions = {
    get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
  };
  return rn;
});

// Mock the styles
jest.mock('../src/styles/HomeStyle', () => ({
  HomeStyle: {
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
  },
}));

describe('HomeScreen Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { UNSAFE_queryAllByType } = render(<HomeScreen />);
    
    // Check that main container components are rendered
    expect(UNSAFE_queryAllByType('CalendarButton')).toHaveLength(1);
    expect(UNSAFE_queryAllByType('MapComponent')).toHaveLength(1);
    expect(UNSAFE_queryAllByType('BottomDrawer')).toHaveLength(1);
    expect(UNSAFE_queryAllByType('FloorSelector')).toHaveLength(1);
  });

  test('MapComponent receives correct props', () => {
    const { UNSAFE_getByType } = render(<HomeScreen />);
    const mapComponent = UNSAFE_getByType('MapComponent');
    
    // Check props passed to MapComponent
    expect(mapComponent.props.drawerHeight).toBeDefined();
    expect(mapComponent.props.setInputDestination).toBeDefined();
    expect(mapComponent.props.selectedPOI).toBeNull();
    expect(mapComponent.props.radius).toBeNull();
  });

  test('BottomDrawer contains all required child components', () => {
    const { UNSAFE_getByType } = render(<HomeScreen />);
    const bottomDrawer = UNSAFE_getByType('BottomDrawer');
    
    // Check for child components inside bottom drawer
    const scrollView = bottomDrawer.props.children;
    // Instead of checking specific name, check that it's a scroll view related component
    expect(scrollView.type.name).toContain('ScrollView');
    
    // Check ScrollView contains all required components
    const scrollViewChildren = scrollView.props.children;
    const childComponents = ['SearchBars', 'RoomSearchBars', 'PointOfInterestSelector', 'DirectionsSteps'];
    
    childComponents.forEach(componentName => {
      const matchingChild = scrollViewChildren.find(child => 
        child.type === componentName || child.type.displayName === componentName);
      expect(matchingChild).toBeDefined();
    });
  });

  test('PointOfInterestSelector receives correct props', () => {
    const { UNSAFE_getByType } = render(<HomeScreen />);
    const poiSelector = UNSAFE_getByType('PointOfInterestSelector');
    
    // Check initial props
    expect(poiSelector.props.pointsOfInterest).toBeNull();
    expect(poiSelector.props.radius).toBeNull();
    expect(typeof poiSelector.props.onPOIChange).toBe('function');
    expect(typeof poiSelector.props.onRadiusChange).toBe('function');
  });

  test('drawerHeight is passed to required components', () => {
    const { UNSAFE_getByType } = render(<HomeScreen />);
    const bottomDrawer = UNSAFE_getByType('BottomDrawer');
    const mapComponent = UNSAFE_getByType('MapComponent');
    
    // Check drawer height is passed to components
    expect(bottomDrawer.props.drawerHeight).toBeDefined();
    expect(mapComponent.props.drawerHeight).toBeDefined();
  });

  test('SearchBars receives inputDestination prop', () => {
    const { UNSAFE_getByType } = render(<HomeScreen />);
    const bottomDrawer = UNSAFE_getByType('BottomDrawer');
    const scrollView = bottomDrawer.props.children;
    const searchBars = scrollView.props.children.find(child => child.type === 'SearchBars');
    
    expect(searchBars).toBeDefined();
    expect(searchBars.props.inputDestination).toBe('');
  });
});