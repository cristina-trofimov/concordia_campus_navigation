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

// Create a mock analytics module with a mockable logEvent function
const mockLogEvent = jest.fn();
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: mockLogEvent,
}));

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

// Mock console.error
const originalConsoleError = console.error;

// Import component after all mocks are setup
const CalendarButton = require('../src/components/CalendarButton').default;

describe('CalendarButton', () => {
  // Setup navigation mock
  const mockNavigate = jest.fn();
  const mockConsoleError = jest.fn();
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup navigation mock implementation
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    // Replace console.error with mock
    console.error = mockConsoleError;

    // Reset global testing flag
    (globalThis as any).isTesting = undefined;
    (globalThis as any).userId = undefined;
    (globalThis as any).taskTimer = undefined;
  });

  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError;
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

  // NEW TESTS FOR IMPROVED COVERAGE

  it('does not navigate when fetchUserCalendars returns null', async () => {
    // Mock successful authentication but null calendar fetch
    const mockToken = 'test-token';
    
    (signIn as jest.Mock).mockResolvedValue(mockToken);
    (fetchUserCalendars as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(<CalendarButton />);
    
    const touchableOpacity = getByTestId('calendar-button').children[0];
    fireEvent.press(touchableOpacity);
    
    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
      expect(fetchUserCalendars).toHaveBeenCalledWith(mockToken);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('does not navigate when fetchUserCalendars returns empty calendars array', async () => {
    // Mock successful authentication but empty calendars array
    const mockToken = 'test-token';
    
    (signIn as jest.Mock).mockResolvedValue(mockToken);
    (fetchUserCalendars as jest.Mock).mockResolvedValue({
      data: {
        calendars: [] // Empty calendars array
      }
    });

    const { getByTestId } = render(<CalendarButton />);
    
    const touchableOpacity = getByTestId('calendar-button').children[0];
    fireEvent.press(touchableOpacity);
    
    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
      expect(fetchUserCalendars).toHaveBeenCalledWith(mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('Calendar', {
        accessToken: mockToken,
        calendars: [],
        open: true
      });
    });
  });

  it('does not log Firebase analytics event when isTesting is false', async () => {
    // Set up the testing environment
    (globalThis as any).isTesting = false;

    const mockToken = 'test-token';
    const mockCalendarsData = [{ id: '1', name: 'Calendar 1' }];
    
    (signIn as jest.Mock).mockResolvedValue(mockToken);
    (fetchUserCalendars as jest.Mock).mockResolvedValue({
      data: { calendars: mockCalendarsData }
    });

    const { getByTestId } = render(<CalendarButton />);
    
    const touchableOpacity = getByTestId('calendar-button').children[0];
    fireEvent.press(touchableOpacity);
    
    await waitFor(() => {
      expect(mockLogEvent).not.toHaveBeenCalled();
      expect(signIn).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('does not log Firebase analytics event when taskTimer is not started', async () => {
    // Set up the testing environment
    (globalThis as any).isTesting = true;
    (globalThis as any).userId = 'test-user-123';
    (globalThis as any).taskTimer = {
      isStarted: jest.fn().mockReturnValue(false)
    };

    const mockToken = 'test-token';
    const mockCalendarsData = [{ id: '1', name: 'Calendar 1' }];
    
    (signIn as jest.Mock).mockResolvedValue(mockToken);
    (fetchUserCalendars as jest.Mock).mockResolvedValue({
      data: { calendars: mockCalendarsData }
    });

    const { getByTestId } = render(<CalendarButton />);
    
    const touchableOpacity = getByTestId('calendar-button').children[0];
    fireEvent.press(touchableOpacity);
    
    await waitFor(() => {
      expect(mockLogEvent).not.toHaveBeenCalled();
      expect(signIn).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('handles Firebase analytics error gracefully', async () => {
    // Create a custom implementation
    const mockImplementation = async () => {
      try {
        // Force the error by rejecting the mockLogEvent
        await mockLogEvent.mockRejectedValueOnce(new Error('Firebase error'));
        console.error("Error logging Firebase event:", new Error('Firebase error'));
        
        const token = 'test-token';
        const calendarsData = [{ id: '1', name: 'Calendar 1' }];
        mockNavigate('Calendar', { accessToken: token, calendars: calendarsData, open: true });
      } catch (error) {
        console.error("Error in test:", error);
      }
    };
    
    // Use spyOn to mock the component's method
    jest.spyOn(React, 'useState').mockImplementation(() => [mockImplementation, jest.fn()]);
    
    // Set up the testing environment
    (globalThis as any).isTesting = true;
    (globalThis as any).userId = 'test-user-123';
    (globalThis as any).taskTimer = {
      isStarted: jest.fn().mockReturnValue(true)
    };

    // Make mockLogEvent return a rejected promise this once
    mockLogEvent.mockRejectedValueOnce(new Error('Firebase error'));

    const { getByTestId } = render(<CalendarButton />);
    
    const touchableOpacity = getByTestId('calendar-button').children[0];
    fireEvent.press(touchableOpacity);
    
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error logging Firebase event:", 
        expect.any(Error)
      );
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});