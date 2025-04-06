import React from 'react';
import 'jest-react-native';
import { render, fireEvent } from '@testing-library/react-native';
import LeftDrawer from '../src/components/LeftDrawer';

// Mock the required dependencies
jest.mock('@expo/vector-icons/Feather', () => 'Feather');
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn().mockImplementation(() => Promise.resolve()),
}));

// Mock the firebase import
jest.mock('../src/components/firebase', () => ({}));

jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: jest.fn(styles => styles),
  flatten: jest.fn(style => style),
  hairlineWidth: 1,
}));

jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: jest.fn(() => 2),
  roundToNearestPixel: jest.fn(dimension => dimension),
  getPixelSizeForLayoutSize: jest.fn(layoutSize => layoutSize * 2),
}));
// Mock the Dimensions API
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
}));

jest.mock('../src/styles/LeftDrawerStyle', () => ({
  LeftDrawerStyle: {
    container: {},
    button: {},
    overlay: {},
    drawer: {},
    contentContainer: {},
    contentImage: {},
  }
}));

// Mock Animated
jest.mock('react-native', () => {
  const RealReactNative = jest.requireActual('react-native');

  // Create simplified mocks for the components we need
  const mockComponents = [
    'View', 'Text', 'TouchableOpacity', 'Modal',
    'Animated', 'Dimensions', 'GestureResponderEvent'
  ].reduce((acc, componentName) => {
    acc[componentName] = componentName;
    return acc;
  }, {});

  return {
    ...RealReactNative,
    ...mockComponents,
    Animated: {
      ...RealReactNative.Animated,
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({ interpolate: jest.fn() })),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(cb => cb && cb()),
      })),
      createAnimatedComponent: jest.fn(component => component),
      View: 'AnimatedView',
    }
  };
});

describe('LeftDrawer', () => {
  beforeEach(() => {
    // Reset the global testing state before each test
    (globalThis).isTesting = false;
    (globalThis).userId = 'test-user';
    (globalThis).taskTimer = {
      start: jest.fn(),
      stop: jest.fn().mockReturnValue(5000),
      getElapsedTime: jest.fn(),
      isStarted: jest.fn(),
    };
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<LeftDrawer />);
    expect(getByTestId('drawer-button')).toBeTruthy();
  });

  it('opens the drawer when the button is pressed', () => {
    const { getByTestId, queryByTestId } = render(<LeftDrawer />);

    // Initially, the drawer overlay should not be visible
    expect(queryByTestId('drawer-overlay')).toBeNull();

    // Press the drawer button
    fireEvent.press(getByTestId('drawer-button'));

    // Now the drawer overlay should be visible
    expect(getByTestId('drawer-overlay')).toBeTruthy();
  });

  it('closes the drawer when pressing the overlay', () => {
    const { getByTestId } = render(<LeftDrawer />);

    // Open the drawer
    fireEvent.press(getByTestId('drawer-button'));

    // Press the overlay to close the drawer
    fireEvent.press(getByTestId('drawer-overlay'));

    // The drawer should be closed (this is harder to test directly with the current setup)
    // We could test the state change or the animation being triggered
  });

  it('shows testing buttons when in testing mode', () => {
    // Set testing mode to true
    (globalThis).isTesting = true;

    const { getByTestId } = render(<LeftDrawer />);

    // Open the drawer
    fireEvent.press(getByTestId('drawer-button'));

    // The testing buttons should be visible
    expect(getByTestId('start-task-button')).toBeTruthy();
    expect(getByTestId('cancel-task-button')).toBeTruthy();
  });

  it('starts the timer when the start task button is pressed', () => {
    // Set testing mode to true
    (globalThis).isTesting = true;

    const { getByTestId } = render(<LeftDrawer />);

    // Open the drawer
    fireEvent.press(getByTestId('drawer-button'));

    // Press the start task button
    fireEvent.press(getByTestId('start-task-button'));

    // The timer start function should have been called
    expect((globalThis).taskTimer.start).toHaveBeenCalled();
  });

  it('stops the timer when the cancel task button is pressed', () => {
    // Set testing mode to true
    (globalThis).isTesting = true;

    const { getByTestId } = render(<LeftDrawer />);

    // Open the drawer
    fireEvent.press(getByTestId('drawer-button'));

    // Press the cancel task button
    fireEvent.press(getByTestId('cancel-task-button'));

    // The timer stop function should have been called
    expect((globalThis).taskTimer.stop).toHaveBeenCalled();
  });
});