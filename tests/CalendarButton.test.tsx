import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { signIn } from '../src/components/HandleGoogle';
import { fetchUserCalendars } from '../src/components/googleCalendarFetching';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@react-navigation/stack', () => ({}));

jest.mock('../src/components/HandleGoogle', () => ({
  signIn: jest.fn(),
}));

jest.mock('../src/components/googleCalendarFetching', () => ({
  fetchUserCalendars: jest.fn(),
}));

// Mock RootStackParamList
jest.mock('../App', () => ({
  RootStackParamList: {},
}));

// Mock FontAwesome
jest.mock('@expo/vector-icons/FontAwesome', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => {
      return <View testID={props.testID || 'mock-icon'} {...props} />;
    },
  };
});

// Mock CalendarStyle
jest.mock('../src/styles/CalendarStyle', () => ({
  CalendarStyle: {
    calendarButtonContainer: {},
    calBtn: {},
    calButtonImg: {},
  },
}));

// Import component after all mocks are setup
const CalendarButton = require('../src/components/CalendarButton').default;

describe('CalendarButton', () => {
  // Setup navigation mock
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup navigation mock implementation
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<CalendarButton />);
    expect(getByTestId('calendar-button')).toBeTruthy();
    expect(getByTestId('calendar-icon')).toBeTruthy();
  });

  it('calls signIn and navigates to Calendar screen when pressed', async () => {
    // Mock successful authentication and calendar data
    const mockToken = 'test-token';
    const mockCalendarsData = [{ id: '1', name: 'Calendar 1' }, { id: '2', name: 'Calendar 2' }];
    
    (signIn as jest.Mock).mockResolvedValue(mockToken);
    (fetchUserCalendars as jest.Mock).mockResolvedValue({
      data: {
        calendars: mockCalendarsData
      }
    });

    const { getByTestId } = render(<CalendarButton />);
    
    // Find the TouchableOpacity by its parent container
    const touchableOpacity = getByTestId('calendar-button').children[0];
    
    // Simulate button press
    fireEvent.press(touchableOpacity);
    
    // Verify the correct functions were called with right parameters
    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
      expect(fetchUserCalendars).toHaveBeenCalledWith(mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('Calendar', {
        accessToken: mockToken,
        calendars: mockCalendarsData,
        open: true 
      });
    });
  });

  it('does not navigate when signIn returns null', async () => {
    // Mock failed authentication
    (signIn as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(<CalendarButton />);
    
    // Find the TouchableOpacity by its parent container
    const touchableOpacity = getByTestId('calendar-button').children[0];
    
    // Simulate button press
    fireEvent.press(touchableOpacity);
    
    // Wait to ensure all promises resolve
    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
      expect(fetchUserCalendars).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('does not navigate when fetchUserCalendars returns invalid data', async () => {
    // Mock successful authentication but failed calendar fetch
    const mockToken = 'test-token';
    
    (signIn as jest.Mock).mockResolvedValue(mockToken);
    (fetchUserCalendars as jest.Mock).mockResolvedValue({
      data: {} // No calendars property
    });

    const { getByTestId } = render(<CalendarButton />);
    
    // Find the TouchableOpacity by its parent container
    const touchableOpacity = getByTestId('calendar-button').children[0];
    
    // Simulate button press
    fireEvent.press(touchableOpacity);
    
    // Wait to ensure all promises resolve
    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
      expect(fetchUserCalendars).toHaveBeenCalledWith(mockToken);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});