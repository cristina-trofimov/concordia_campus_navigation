import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../src/components/screens/HomeScreen';

// Mock all the imported components
jest.mock('../src/components/BottomDrawer', () => 'BottomDrawer');
jest.mock('../src/data/CoordsContext', () => ({
  CoordsProvider: ({ children }) => children,
}));
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
}));
jest.mock('../src/data/IndoorContext', () => ({
  IndoorsProvider: ({ children }) => children,
}));
jest.mock('../src/components/CalendarButton', () => 'CalendarButton');
jest.mock('@expo/vector-icons/Feather', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../src/components/FloorSelector', () => ({
  FloorSelector: 'FloorSelector',
}));
jest.mock('@expo/vector-icons/Ionicons', () => ({
  __esModule: true,
  default: (props) => props.name === "arrow-back-outline" ? <div>BackIcon</div> : null,
}));
jest.mock('../src/components/SearchBars', () => 'SearchBars');
jest.mock('../src/components/DirectionsSteps', () => 'DirectionsSteps');
jest.mock('../src/components/MapComponent', () => 'MapComponent');
jest.mock('../src/components/Point-of-interest_Form', () => 'PointOfInterestSelector');
jest.mock('../src/components/RoomSearchBars', () => ({
  RoomSearchBars: 'RoomSearchBars',
}));
jest.mock('../src/components/UpcomingClassItem', () => 'UpcomingClassItem');

// Mock class events with different scenarios
const mockClassEvents = [];
jest.mock('../src/data/ClassEventsContext', () => ({
  useClassEvents: jest.fn().mockImplementation(() => ({
    classEvents: mockClassEvents,
    setClassEvents: jest.fn()
  })),
}));

// Import the actual hook for testing direct usage
import { useClassEvents } from '../src/data/ClassEventsContext';

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
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeAllListeners: jest.fn(),
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
    mockClassEvents.length = 0;
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

    // Check for ScrollView component inside bottom drawer
    const scrollView = bottomDrawer.props.children;
    expect(scrollView.type.name).toContain('ScrollView');

    // Check ScrollView contains SearchBars component
    expect(scrollView.props.children).toBeDefined();

    // Find components safely with proper type checks
    const findComponentByType = (children, componentName) => {
      // Handle case when children is not an array
      if (!Array.isArray(children)) {
        if (!children) return undefined;
        return children.type === componentName ? children : undefined;
      }

      // Filter out null or undefined children first
      return children
        .filter(child => child !== null && child !== undefined)
        .find(child => child.type === componentName);
    };

    // Check for SearchBars
    const searchBars = findComponentByType(scrollView.props.children, 'SearchBars');
    expect(searchBars).toBeDefined();

    // Check for RoomSearchBars
    const roomSearchBars = findComponentByType(scrollView.props.children, 'RoomSearchBars');
    expect(roomSearchBars).toBeDefined();

    // Check for DirectionsSteps
    const directionsSteps = findComponentByType(scrollView.props.children, 'DirectionsSteps');
    expect(directionsSteps).toBeDefined();

    // No longer check for PointOfInterestSelector inside BottomDrawer
    // since it's been moved outside
  });

  // Add a new test to check for PointOfInterestSelector in the main view
  test('PointOfInterestSelector exists in the main view', () => {
    const { UNSAFE_getByType } = render(<HomeScreen />);
    const poiSelector = UNSAFE_getByType('PointOfInterestSelector');
    expect(poiSelector).toBeDefined();
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
    const searchBars = UNSAFE_getByType('SearchBars');

    expect(searchBars).toBeDefined();
    expect(searchBars.props.inputDestination).toBe('');
  });

  test('setInputDestination function updates state', () => {
    const { UNSAFE_getByType } = render(<HomeScreen />);
    const mapComponent = UNSAFE_getByType('MapComponent');

    // Get setInputDestination function from props
    const setInputDestination = mapComponent.props.setInputDestination;

    // Call the function
    setInputDestination('Engineering Building');

    // Re-get SearchBars and check if inputDestination was updated
    const searchBars = UNSAFE_getByType('SearchBars');
    expect(searchBars.props.inputDestination).toBe('Engineering Building');
  });

  test('POI selection functions update state correctly', () => {
    const { UNSAFE_getByType } = render(<HomeScreen />);
    const poiSelector = UNSAFE_getByType('PointOfInterestSelector');

    // Get state setter functions from props
    const onPOIChange = poiSelector.props.onPOIChange;
    const onRadiusChange = poiSelector.props.onRadiusChange;

    // Update states
    onPOIChange('Restaurant');
    onRadiusChange(500);

    // Re-get component and check if props were updated
    const updatedPoiSelector = UNSAFE_getByType('PointOfInterestSelector');
    const mapComponent = UNSAFE_getByType('MapComponent');

    expect(updatedPoiSelector.props.pointsOfInterest).toBe('Restaurant');
    expect(updatedPoiSelector.props.radius).toBe(500);
    expect(mapComponent.props.selectedPOI).toBe('Restaurant');
    expect(mapComponent.props.radius).toBe(500);
  });

  test('renders UpcomingClassItem when class events exist and no destination is set', () => {
    // Set up mock class events
    const mockEvent = { id: '1', title: 'Math 101', location: 'Room 202', startTime: new Date().toISOString() };
    mockClassEvents.push(mockEvent);

    // Re-render with mock class events
    const { UNSAFE_queryAllByType } = render(<HomeScreen />);

    // Check if UpcomingClassItem is rendered
    expect(UNSAFE_queryAllByType('UpcomingClassItem')).toHaveLength(1);

    // Verify props
    const classItem = UNSAFE_queryAllByType('UpcomingClassItem')[0];
    expect(classItem.props.calendarEvent).toBe(mockEvent);
    expect(typeof classItem.props.setInputDestination).toBe('function');
  });

  test('does not render UpcomingClassItem when destination is set', () => {
    // Set up mock class events
    const mockEvent = { id: '1', title: 'Math 101', location: 'Room 202', startTime: new Date().toISOString() };
    mockClassEvents.push(mockEvent);

    // Render component
    const { UNSAFE_getByType, UNSAFE_queryAllByType, rerender } = render(<HomeScreen />);

    // Verify UpcomingClassItem is initially rendered
    expect(UNSAFE_queryAllByType('UpcomingClassItem')).toHaveLength(1);

    // Set a destination using the component's setInputDestination
    const setInputDestination = UNSAFE_getByType('MapComponent').props.setInputDestination;

    // Create an updated component with the modified state
    const UpdatedHomeScreen = () => {
      // This ensures the state is set before rendering
      React.useEffect(() => {
        setInputDestination('Library');
      }, []);
      return <HomeScreen />;
    };

    // Re-render with the updated component
    rerender(<UpdatedHomeScreen />);

    // Verify UpcomingClassItem is not rendered when destination is set
    expect(UNSAFE_queryAllByType('UpcomingClassItem')).toHaveLength(0);
  });

  test('does not render UpcomingClassItem when no class events exist', () => {
    // Ensure mockClassEvents is empty
    mockClassEvents.length = 0;

    // Render component
    const { UNSAFE_queryAllByType } = render(<HomeScreen />);

    // Verify UpcomingClassItem is not rendered
    expect(UNSAFE_queryAllByType('UpcomingClassItem')).toHaveLength(0);
  });

  test('handles multiple class events correctly', () => {
    // Set up multiple mock class events
    const mockEvents = [
      { id: '1', title: 'Math 101', location: 'Room 202', startTime: new Date().toISOString() },
      { id: '2', title: 'Physics 301', location: 'Lab 105', startTime: new Date().toISOString() }
    ];
    mockClassEvents.push(...mockEvents);

    // Render component
    const { UNSAFE_queryAllByType } = render(<HomeScreen />);

    // Verify correct number of UpcomingClassItem components
    expect(UNSAFE_queryAllByType('UpcomingClassItem')).toHaveLength(2);

    // Verify props of each item
    const classItems = UNSAFE_queryAllByType('UpcomingClassItem');
    expect(classItems[0].props.calendarEvent).toBe(mockEvents[0]);
    expect(classItems[1].props.calendarEvent).toBe(mockEvents[1]);
  });
});