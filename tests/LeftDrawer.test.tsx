import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LeftDrawer from '../src/components/LeftDrawer';

// Mock the necessary modules
jest.mock('react-native/Libraries/Animated/Animated', () => ({
  Value: jest.fn(() => ({
    interpolate: jest.fn(),
  })),
  timing: jest.fn(() => ({
    start: jest.fn(),
  })),
  View: 'Animated.View',
}));

jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 400, height: 800 }),
}));

// Mock the Expo vector icons
jest.mock('@expo/vector-icons/Feather', () => 'Feather');
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Mock console.log
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('LeftDrawer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = mockConsoleLog;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  test('renders without crashing', () => {
    render(<LeftDrawer />);
  });

  test('toggles drawer visibility when button is pressed', () => {
    const { getByTestId } = render(<LeftDrawer />);
    
    // Add testID to your TouchableOpacity in the component
    const menuButton = getByTestId('menu-button');
    
    // Check if it's rendered
    expect(menuButton).toBeTruthy();
    
    // Press the button to open drawer
    fireEvent.press(menuButton);
    
    // Press again to close
    fireEvent.press(menuButton);
  });

  test('menu items log correct messages when pressed', () => {
    const { getByTestId, getByText } = render(<LeftDrawer />);
    
    // Open the drawer
    fireEvent.press(getByTestId('menu-button'));
    
    // Press each menu item
    fireEvent.press(getByText('Your Favorites'));
    expect(mockConsoleLog).toHaveBeenCalledWith('your favorites was presses');
    
    fireEvent.press(getByText('Your Timeline'));
    expect(mockConsoleLog).toHaveBeenCalledWith('your timeline was presses');
    
    fireEvent.press(getByText('Help & Feedback'));
    expect(mockConsoleLog).toHaveBeenCalledWith('help & feedback was presses');
    
    fireEvent.press(getByText('Settings'));
    expect(mockConsoleLog).toHaveBeenCalledWith('settings was presses');
  });
});