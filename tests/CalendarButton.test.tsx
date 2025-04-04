import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CalendarButton from '../src/components/CalendarButton';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { signIn } from '../src/components/HandleGoogle';
import { fetchUserCalendars } from '../src/components/googleCalendarFetching';


jest.mock('@react-navigation/native');
jest.mock('../src/components/HandleGoogle');
jest.mock('../src/components/googleCalendarFetching');
jest.mock('@expo/vector-icons/FontAwesome', () => jest.fn().mockImplementation(() => 'MockedIcon'));

describe('CalendarButton', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
  const mockFetchUserCalendars = fetchUserCalendars as jest.MockedFunction<typeof fetchUserCalendars>;

  beforeEach(() => {
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    mockSignIn.mockClear();
    mockFetchUserCalendars.mockClear();
    mockNavigation.navigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<CalendarButton />);
    expect(getByTestId('calendar-button')).toBeTruthy();
    expect(getByTestId('calendar-icon')).toBeTruthy();
  });

  it('navigates to Calendar screen with correct params when signIn and fetch are successful', async () => {
    const mockToken = 'test-token';
    const mockCalendars = {
      data: {
        calendars: [{ id: '1', name: 'Test Calendar' }]
      }
    };
    
    mockSignIn.mockResolvedValue(mockToken);
    mockFetchUserCalendars.mockResolvedValue(mockCalendars);

    const { getByTestId } = render(<CalendarButton />);
    fireEvent.press(getByTestId('calendar-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockFetchUserCalendars).toHaveBeenCalledWith(mockToken);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Calendar', {
        accessToken: mockToken,
        calendars: mockCalendars.data.calendars
      });
    });
  });

  it('does not navigate when signIn fails', async () => {
    mockSignIn.mockResolvedValue(null);

    const { getByTestId } = render(<CalendarButton />);
    fireEvent.press(getByTestId('calendar-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockFetchUserCalendars).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  it('does not navigate when fetchUserCalendars returns no calendars', async () => {
    const mockToken = 'test-token';
    
    mockSignIn.mockResolvedValue(mockToken);
    mockFetchUserCalendars.mockResolvedValue({ data: { calendars: null } });

    const { getByTestId } = render(<CalendarButton />);
    fireEvent.press(getByTestId('calendar-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockFetchUserCalendars).toHaveBeenCalledWith(mockToken);
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  it('handles errors during signIn', async () => {
    mockSignIn.mockRejectedValue(new Error('Sign in failed'));

    const { getByTestId } = render(<CalendarButton />);
    fireEvent.press(getByTestId('calendar-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockFetchUserCalendars).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  it('handles errors during fetchUserCalendars', async () => {
    const mockToken = 'test-token';
    
    mockSignIn.mockResolvedValue(mockToken);
    mockFetchUserCalendars.mockRejectedValue(new Error('Fetch failed'));

    const { getByTestId } = render(<CalendarButton />);
    fireEvent.press(getByTestId('calendar-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockFetchUserCalendars).toHaveBeenCalledWith(mockToken);
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });
});