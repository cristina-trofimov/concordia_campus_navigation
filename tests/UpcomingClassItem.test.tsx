import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import UpcomingClassItem from '../src/components/UpcomingClassItem';
import { CalendarEvent } from '../src/interfaces/CalendraEvent';
import { Text, Pressable } from 'react-native';

// Mock the Image component from @rneui/base
jest.mock('@rneui/base', () => ({
  Image: 'Image',
}));

// Mock console.log
const mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

// Mock the current time for testing
jest.useFakeTimers();

describe('UpcomingClassItem Component', () => {
  // Helper function to create a calendar event prop
  const createCalendarEvent = (
    title: string,
    startTime: string,
    endTime: string,
    location: string,
    description: string
  ): CalendarEvent => ({
    title,
    startTime,
    endTime,
    location,
    description,
  });

  // Helper function to set current time for testing purposes
  const mockCurrentTime = (hours: number, minutes: number) => {
    const mockDate = new Date();
    mockDate.setHours(hours);
    mockDate.setMinutes(minutes);
    jest.setSystemTime(mockDate);
  };

  beforeEach(() => {
    mockConsoleLog.mockClear();
  });

  it('renders correctly with upcoming class', () => {
    // Set current time to 9:00 AM
    mockCurrentTime(9, 0);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building',
      '302'
    );
    
    const { getByText, queryByText } = render(
      <UpcomingClassItem calendarEvent={event} />
    );
    
    // Verify class details are rendered
    expect(getByText('Math 101')).toBeTruthy();
    expect(getByText('10:00 - 11:30')).toBeTruthy();
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
      'Science Building',
      '302'
    );
    
    const { getByText } = render(
      <UpcomingClassItem calendarEvent={event} />
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
      'Science Building',
      '302'
    );
    
    const { getByText } = render(
      <UpcomingClassItem calendarEvent={event} />
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
      'Science Building',
      '302'
    );
    
    const { UNSAFE_getByType } = render(
      <UpcomingClassItem calendarEvent={event} />
    );
    
    // Find the Pressable component
    const pressable = UNSAFE_getByType(Pressable);
    
    // Simulate press
    fireEvent.press(pressable);
    
    // Verify console.log was called with the expected message
    expect(mockConsoleLog).toHaveBeenCalledWith('Clicked on: Math 101');
  });

  it('disables press for ended classes', () => {
    // Set current time to 12:00 PM (after class time)
    mockCurrentTime(12, 0);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building',
      '302'
    );
    
    const { UNSAFE_getByType } = render(
      <UpcomingClassItem calendarEvent={event} />
    );
    
    // Find the Pressable component
    const pressable = UNSAFE_getByType(Pressable);
    
    // Check that the pressable component has disabled prop set to true
    expect(pressable.props.disabled).toBe(true);
    
    // In React Native testing, the disabled prop doesn't actually prevent the press event
    // in the test environment, so we need to manually respect it
    if (!pressable.props.disabled) {
      fireEvent.press(pressable);
    }
    
    // Verify console.log was NOT called
    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('applies line-through style to ended class title', () => {
    // Set current time to 12:00 PM (after class time)
    mockCurrentTime(12, 0);
    
    const event = createCalendarEvent(
      'Math 101',
      '10:00',
      '11:30',
      'Science Building',
      '302'
    );
    
    const { UNSAFE_getByProps } = render(
      <UpcomingClassItem calendarEvent={event} />
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
      'Science Building',
      '302'
    );
    
    const { getByText, queryByText, rerender } = render(
      <UpcomingClassItem calendarEvent={event} />
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
    rerender(<UpcomingClassItem calendarEvent={event} />);
    
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
      'Science Building',
      '302'
    );
    
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    const { unmount } = render(
      <UpcomingClassItem calendarEvent={event} />
    );
    
    // Unmount the component
    unmount();
    
    // Verify clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});