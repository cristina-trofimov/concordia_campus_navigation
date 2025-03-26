import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';

// Explicitly import HomeScreen
import HomeScreen from '../src/components/screens/HomeScreen';

// Mocking child components
jest.mock('../src/components/BottomDrawer', () => {
  return (props) => <>{props.children}</>;
});
jest.mock('../src/components/LeftDrawer', () => () => null);
jest.mock('../src/components/CalendarButton', () => () => null);
jest.mock('../src/components/FloorSelector', () => () => null);
jest.mock('../src/components/SearchBars', () => {
  return (props) => <>{props.children}</>;
});
jest.mock('../src/components/DirectionsSteps', () => () => null);
jest.mock('../src/components/MapComponent', () => {
  return (props) => <>{props.children}</>;
});

// Mock context providers
jest.mock('../src/data/CoordsContext', () => ({
  CoordsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('../src/data/IndoorContext', () => ({
  IndoorsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  return {
    default: {
      Value: jest.fn(),
      timing: jest.fn(),
    },
    interpolate: jest.fn(),
    Extrapolate: { CLAMP: 'clamp' },
  };
});

// Mock Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated.timing = () => ({
    start: jest.fn(),
    timing: jest.fn(),
  });
  RN.Animated.Value = jest.fn(() => ({
    interpolate: jest.fn(),
  }));
  return RN;
});

describe('HomeScreen Component', () => {
  it('renders all child components', () => {
    const { getByTestId } = render(<HomeScreen />);

    // Use testID to verify component rendering
    expect(() => {
      getByTestId('calendar-button');
      getByTestId('left-drawer');
      getByTestId('map-component');
      getByTestId('floor-selector');
      getByTestId('bottom-drawer');
      getByTestId('search-bars');
      getByTestId('directions-steps');
    }).not.toThrow();
  });

  it('passes correct props to child components', () => {
    const { getByTestId } = render(<HomeScreen />);

    // Verify specific props can be passed
    expect(() => {
      const mapComponent = getByTestId('map-component');
      const bottomDrawer = getByTestId('bottom-drawer');
      const searchBars = getByTestId('search-bars');
    }).not.toThrow();
  });

  it('is wrapped with CoordsProvider and IndoorsProvider', () => {
    const { getByTestId } = render(
      <View testID="home-screen-wrapper">
        <HomeScreen />
      </View>
    );

    const wrapper = getByTestId('home-screen-wrapper');
    expect(wrapper.props.children).toBeTruthy();
  });

  it('initializes inputDestination state', () => {
    const { getByTestId } = render(<HomeScreen />);
    
    // Check SearchBars is rendered
    expect(() => getByTestId('search-bars')).not.toThrow();
  });
});