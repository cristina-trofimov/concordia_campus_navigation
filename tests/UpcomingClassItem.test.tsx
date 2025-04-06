import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import UpcomingClassItem from '../src/components/UpcomingClassItem';
import { CalendarEvent } from '../src/interfaces/CalendraEvent';
import { Text, Pressable } from 'react-native';

// Mock the Image component from @rneui/base
jest.mock('@rneui/base', () => ({
  Image: 'Image',
}));
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
}));
// Mock console.log
const mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

// Mock the current time for testing
jest.useFakeTimers();

describe('UpcomingClassItem Component', () => {
  // Mock setInputDestination function
  const mockSetInputDestination = jest.fn();
  
  // Helper function to create a calendar event prop with proper ISO format
  const createCalendarEvent = (
    title: string,
    startTime: string,
    endTime: string,
    location: string,
    description: string
  ): CalendarEvent => {
    // Get today's date for creating ISO strings
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    // Create ISO strings for the start and end times
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');
    
    // Create UTC ISO strings that will convert correctly to local time
    // For testing, we need to ensure these times appear correctly after component's conversion
    const startDate = new Date(year, parseInt(month) - 1, parseInt(day), parseInt(startHour), parseInt(startMinute));
    const endDate = new Date(year, parseInt(month) - 1, parseInt(day), parseInt(endHour), parseInt(endMinute));
    
    return {
      title,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      location,
      description,
    };
  };

  // Helper function to set current time for testing purposes
  const mockCurrentTime = (hours: number, minutes: number) => {
    const mockDate = new Date();
    mockDate.setHours(hours);
    mockDate.setMinutes(minutes);
    mockDate.setSeconds(0);
    mockDate.setMilliseconds(0);
    jest.setSystemTime(mockDate);
  };

  beforeEach(() => {
    mockConsoleLog.mockClear();
    mockSetInputDestination.mockClear();
  });

  it('renders correctly with upcoming class', () => {
    // Set current time to 9:00 AM
    mockCurrentTime(9, 0);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building, 302',
      '302'
    );
    
    const { getByText } = render(
      <UpcomingClassItem calendarEvent={event} setInputDestination={mockSetInputDestination} />
    );
    
    // Verify class details are rendered
    expect(getByText('Math 101')).toBeTruthy();
    
    // Get the formatted times as they would appear in the component
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    const startHours = startDate.getHours().toString().padStart(2, '0');
    const startMinutes = startDate.getMinutes().toString().padStart(2, '0');
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    const formattedTimeRange = `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
    
    expect(getByText(formattedTimeRange)).toBeTruthy();
    expect(getByText('Science Building')).toBeTruthy();
    expect(getByText('Room 302')).toBeTruthy();
    
    // Verify status is "Upcoming"
    expect(getByText('Upcoming')).toBeTruthy();
  });

  it('renders correctly with class in progress', () => {
    // Set current time to 10:30 AM (during class time)
    mockCurrentTime(10, 30);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building, 302',
      '302'
    );
    
    const { getByText } = render(
      <UpcomingClassItem calendarEvent={event} setInputDestination={mockSetInputDestination} />
    );
    
    // Verify status is "In progress"
    expect(getByText('In progress')).toBeTruthy();
  });

  it('renders correctly with ended class', () => {
    // Set current time to 12:00 PM (after class time)
    mockCurrentTime(12, 0);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building, 302',
      '302'
    );
    
    const { getByText } = render(
      <UpcomingClassItem calendarEvent={event} setInputDestination={mockSetInputDestination} />
    );
    
    // Verify status is "Ended"
    expect(getByText('Ended')).toBeTruthy();
  });

  it('handles press event for active classes', () => {
    // Set current time to 9:00 AM (before class time)
    mockCurrentTime(9, 0);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building, 302',
      '302'
    );
    
    const { UNSAFE_getByType } = render(
      <UpcomingClassItem calendarEvent={event} setInputDestination={mockSetInputDestination} />
    );
    
    // Find the Pressable component
    const pressable = UNSAFE_getByType(Pressable);
    
    // Simulate press
    fireEvent.press(pressable);
    
    // Verify setInputDestination was called with the expected address
    expect(mockSetInputDestination).toHaveBeenCalledWith('302');
  });

  it('disables press for ended classes', () => {
    // Set current time to 12:00 PM (after class time)
    mockCurrentTime(12, 0);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building, 302',
      '302'
    );
    
    const { UNSAFE_getByType, getByText } = render(
      <UpcomingClassItem calendarEvent={event} setInputDestination={mockSetInputDestination} />
    );
    
    // Find the Pressable component
    const pressable = UNSAFE_getByType(Pressable);
    
    // Check that the pressable component has disabled prop set to true
    expect(pressable.props.disabled).toBe(true);
    
    // Verify status is "Ended" which confirms the press should be disabled
    expect(getByText('Ended')).toBeTruthy();
    
    // Reset the mock to make sure our check is clean
    mockSetInputDestination.mockClear();
    
    // Get the styles array that would be applied and check the opacity in the second style object
    const styles = pressable.props.style({ pressed: false });
    expect(styles[1]).toHaveProperty('opacity', 0.5);
  });

  it('applies line-through style to ended class title', () => {
    // Set current time to 12:00 PM (after class time)
    mockCurrentTime(12, 0);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building, 302',
      '302'
    );
    
    const { UNSAFE_getByProps } = render(
      <UpcomingClassItem calendarEvent={event} setInputDestination={mockSetInputDestination} />
    );
    
    // Find the Text component with the title and check its style
    const titleText = UNSAFE_getByProps({ children: 'Math 101' });
    expect(titleText.props.style[0]).toBeTruthy();
    expect(titleText.props.style[1]).toEqual({ textDecorationLine: 'line-through' });
  });

  it('updates status when time changes', () => {
    // Set initial time to 9:30 AM (before class)
    mockCurrentTime(9, 30);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building, 302',
      '302'
    );
    
    const { getByText, queryByText, rerender } = render(
      <UpcomingClassItem calendarEvent={event} setInputDestination={mockSetInputDestination} />
    );
    
    // Verify initial status is "Upcoming"
    expect(getByText('Upcoming')).toBeTruthy();
    
    // Advance time to 10:15 AM (during class)
    mockCurrentTime(10, 15);
    
    // Trigger the interval callback manually
    act(() => {
      jest.advanceTimersByTime(20000);
    });
    
    // Re-render with the same props to reflect state update
    rerender(<UpcomingClassItem calendarEvent={event} setInputDestination={mockSetInputDestination} />);
    
    // Verify status changed to "In progress"
    expect(getByText('In progress')).toBeTruthy();
    expect(queryByText('Upcoming')).toBeNull();
  });

  it('clears interval on unmount', () => {
    // Set current time to 9:00 AM
    mockCurrentTime(9, 0);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building, 302',
      '302'
    );
    
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = render(
      <UpcomingClassItem calendarEvent={event} setInputDestination={mockSetInputDestination} />
    );
    
    // Unmount the component
    unmount();
    
    // Verify clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});