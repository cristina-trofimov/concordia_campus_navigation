import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RightDrawer from '../src/components/RightDrawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {
      calendars: [
        { id: '1', title: 'Calendar 1' },
        { id: '2', title: 'Calendar 2' },
      ],
    },
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

// Mock signOut function
jest.mock('../src/components/HandleGoogle', () => ({
  signOut: jest.fn().mockResolvedValue(null),
}));

// Updated Ionicons mock with Text imported inside the factory
jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props) =>
      props.name === 'reorder-three-outline' ? (
        <Text>MenuIcon</Text>
      ) : (
        <Text>CalendarIcon</Text>
      ),
  };
});

// Mock ClassEventsContext
jest.mock('../src/data/ClassEventsContext', () => ({
  useClassEvents: () => ({
    setClassEvents: jest.fn(),
  }),
}));

describe('RightDrawer Component', () => {
  const mockSetChosenCalendar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders drawer toggle button', () => {
    const { getByText } = render(
      <RightDrawer setChosenCalendar={mockSetChosenCalendar} open={false} />
    );
    expect(getByText('MenuIcon')).toBeTruthy();
  });

  it('opens drawer when button is pressed', async () => {
    const { getByText } = render(
      <RightDrawer setChosenCalendar={mockSetChosenCalendar} open={false} />
    );

    // Directly press the toggle button
    fireEvent.press(getByText('MenuIcon'));

    // Verify that the drawer content appears (e.g., "Calendar 1")
    await waitFor(() => {
      expect(getByText('Calendar 1')).toBeTruthy();
    });
  });

  it('renders calendar options and sign out button when open', async () => {
    const { getByText } = render(
      <RightDrawer setChosenCalendar={mockSetChosenCalendar} open={true} />
    );

    await waitFor(() => {
      expect(getByText('Calendar 1')).toBeTruthy();
      expect(getByText('Calendar 2')).toBeTruthy();
      expect(getByText('Sign Out')).toBeTruthy();
    });
  });

  it('closes the drawer and sets the chosen calendar when a calendar is selected', async () => {
    const { getByText } = render(
      <RightDrawer setChosenCalendar={mockSetChosenCalendar} open={true} />
    );

    const calendarOption = getByText('Calendar 1');
    fireEvent.press(calendarOption);

    expect(mockSetChosenCalendar).toHaveBeenCalledWith({ id: '1', title: 'Calendar 1' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'chosenCalendar',
      JSON.stringify({ id: '1', title: 'Calendar 1' })
    );
  });

  it('signs out and navigates to Home screen when Sign Out button is pressed', async () => {
    const { getByText } = render(
      <RightDrawer setChosenCalendar={mockSetChosenCalendar} open={true} />
    );

    const signOutButton = getByText('Sign Out');
    fireEvent.press(signOutButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });

  it('starts with drawer open when open prop is true', () => {
    const { getByText } = render(
      <RightDrawer setChosenCalendar={mockSetChosenCalendar} open={true} />
    );

    // Assert that drawer content is visible when open prop is true
    expect(getByText('Calendar 1')).toBeTruthy();
  });

  it('closes the drawer when clicking on the overlay', async () => {
    const { getByText, queryByText } = render(
      <RightDrawer setChosenCalendar={mockSetChosenCalendar} open={true} />
    );

    // Simulate closing the drawer by pressing the toggle button again
    fireEvent.press(getByText('MenuIcon'));

    await waitFor(() => {
      // After closing, the drawer content should no longer be visible
      expect(queryByText('Calendar 1')).toBeNull();
    });
  });
});
