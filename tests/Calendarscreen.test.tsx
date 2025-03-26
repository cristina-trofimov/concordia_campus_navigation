import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import CalendarScreen from '../src/components/screens/CalendarScreen';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

jest.mock('@expo/vector-icons/Feather', () => 'Feather');
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Mock more comprehensively
jest.mock('../src/components/RightDrawer', () => {
  return {
    __esModule: true,
    default: () => null,
  };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

jest.mock('../src/components/signin', () => ({
  signIn: jest.fn().mockResolvedValue('mockAccessToken'),
}));

jest.mock('../src/components/googleCalendarFetching', () => ({
  fetchCalendarEventsByCalendarId: jest.fn().mockResolvedValue({
    data: {
      events: [
        {
          id: '1',
          title: 'Test Event',
          startTime: '2024-03-26T10:00:00',
          endTime: '2024-03-26T11:00:00',
        }
      ]
    }
  }),
}));

jest.mock('@howljs/calendar-kit', () => ({
  CalendarContainer: jest.fn(({ children }) => children),
  CalendarHeader: jest.fn(() => null),
  CalendarBody: jest.fn(() => null),
}));

describe('CalendarScreen', () => {
  // Mock navigation before each test
  beforeEach(() => {
    const mockNavigation = {
      goBack: jest.fn(),
      navigate: jest.fn(),
    };
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
  });

  const renderComponent = () => {
    return render(
      <NavigationContainer>
        <CalendarScreen />
      </NavigationContainer>
    );
  };

  it('renders without crashing', () => {
    const { getByText } = renderComponent();
    
    expect(() => {
      getByText(/Jan\.|Feb\.|Mar\.|Apr\.|May|June|July|Aug\.|Sept\.|Oct\.|Nov\.|Dec\./);
    }).not.toThrow();
  });

  it('opens and closes modal for event editing', () => {
    const { queryByText } = renderComponent();
    
    // Placeholder test - you'll need to modify based on actual implementation
    expect(queryByText('Edit Event')).toBeNull();
    
    // TODO: Add actual modal opening logic when implemented
  });
});