// LeftDrawer.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LeftDrawer from '../src/components/LeftDrawer';

// Create a mock for the analytics logEvent function.
// Renaming to "mockLogEvent" (allowed because it starts with "mock").
const mockLogEvent = jest.fn();
jest.mock('@react-native-firebase/analytics', () => {
  return () => ({
    logEvent: mockLogEvent,
  });
});

// Mock Ionicons to render a Text element with "MenuIcon"
jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props) => (
      <Text>{props.name === 'reorder-three-outline' ? 'MenuIcon' : 'Ionicon'}</Text>
    ),
  };
});

// Mock Feather to render a Text element for icons
jest.mock('@expo/vector-icons/Feather', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props) => {
      if (props.name === 'play') {
        return <Text>PlayIcon</Text>;
      } else if (props.name === 'x') {
        return <Text>CancelIcon</Text>;
      }
      return <Text>FeatherIcon</Text>;
    },
  };
});

// Set global testing flag and userId so that the testing UI is rendered
beforeAll(() => {
  globalThis.isTesting = true;
  globalThis.userId = 'test-user';
});

describe('LeftDrawer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the drawer toggle button', () => {
    const { getByTestId, getByText } = render(<LeftDrawer />);
    // Verify the toggle button is rendered
    const toggleButton = getByTestId('drawer-button');
    expect(toggleButton).toBeTruthy();
    // Verify that the Ionicons icon text is rendered
    expect(getByText('MenuIcon')).toBeTruthy();
  });

  it('opens the drawer when the toggle button is pressed', async () => {
    const { getByTestId } = render(<LeftDrawer />);
    // Initially, the drawer overlay should not be in the tree
    expect(() => getByTestId('drawer-overlay')).toThrow();

    // Press the toggle button to open the drawer
    fireEvent.press(getByTestId('drawer-button'));

    // Wait for the overlay (and drawer content) to appear
    await waitFor(() => {
      expect(getByTestId('drawer-overlay')).toBeTruthy();
    });

    // Verify that the task buttons are rendered when in testing mode
    expect(getByTestId('start-task-button')).toBeTruthy();
    expect(getByTestId('cancel-task-button')).toBeTruthy();
  });

  it('closes the drawer when overlay is pressed', async () => {
    const { getByTestId, queryByTestId } = render(<LeftDrawer />);
    // Open the drawer first
    fireEvent.press(getByTestId('drawer-button'));

    await waitFor(() => {
      expect(getByTestId('drawer-overlay')).toBeTruthy();
    });

    const overlay = getByTestId('drawer-overlay');
    // Simulate a press on the overlay and pass an event object with target and currentTarget
    fireEvent.press(overlay, { target: overlay, currentTarget: overlay });

    await waitFor(() => {
      expect(queryByTestId('drawer-overlay')).toBeNull();
    });
  });

  it('triggers analytics event when Start Task button is pressed', async () => {
    const { getByTestId } = render(<LeftDrawer />);
    // Open the drawer
    fireEvent.press(getByTestId('drawer-button'));

    await waitFor(() => {
      expect(getByTestId('start-task-button')).toBeTruthy();
    });

    // Press the Start Task button
    fireEvent.press(getByTestId('start-task-button'));

    // Verify that analytics.logEvent was called with "start_task"
    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('start_task', {
        message: 'Started a task',
        user_id: 'test-user',
      });
    });
  });

  it('triggers analytics event when Cancel Task button is pressed after starting a task', async () => {
    const { getByTestId } = render(<LeftDrawer />);
    // Open the drawer
    fireEvent.press(getByTestId('drawer-button'));

    await waitFor(() => {
      expect(getByTestId('start-task-button')).toBeTruthy();
    });

    // Press the Start Task button to start the timer
    fireEvent.press(getByTestId('start-task-button'));

    // Wait briefly to ensure elapsed time is greater than 0
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Press the Cancel Task button
    fireEvent.press(getByTestId('cancel-task-button'));

    // Verify that analytics.logEvent was called with "cancel_task"
    await waitFor(() => {
      expect(mockLogEvent).toHaveBeenCalledWith('cancel_task', {
        message: 'Cancelled a task',
        user_id: 'test-user',
      });
    });
  });
});
