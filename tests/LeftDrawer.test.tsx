import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LeftDrawer from '../src/components/LeftDrawer'; // Adjust path if needed

// Mock global vars used in the component
(globalThis as any).isTesting = true;
(globalThis as any).taskTimer = {
  start: jest.fn(),
  stop: jest.fn(() => 1000),
};
(globalThis as any).userId = 'test-user';

// Mock Firebase analytics
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
}));
jest.mock('@expo/vector-icons/Feather', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@expo/vector-icons/Ionicons', () => ({
  __esModule: true,
  default: (props) => props.name === "arrow-back-outline" ? <div>BackIcon</div> : null,
}));

describe('LeftDrawer Component', () => {
  it('renders drawer toggle button', () => {
    const { getByTestId } = render(<LeftDrawer />);
    expect(getByTestId('drawer-button')).toBeTruthy();
  });

  it('opens drawer when button is pressed', async () => {
    const { getByTestId, queryByTestId } = render(<LeftDrawer />);

    const drawerButton = getByTestId('drawer-button');
    fireEvent.press(drawerButton);

    await waitFor(() => {
      expect(queryByTestId('drawer-overlay')).toBeTruthy();
    });
  });

  it('renders Start and Cancel Task buttons in test mode', async () => {
    const { getByTestId } = render(<LeftDrawer />);

    fireEvent.press(getByTestId('drawer-button'));

    await waitFor(() => {
      expect(getByTestId('start-task-button')).toBeTruthy();
      expect(getByTestId('cancel-task-button')).toBeTruthy();
    });
  });

  it('calls start function when Start Task is pressed', async () => {
    const { getByTestId } = render(<LeftDrawer />);

    fireEvent.press(getByTestId('drawer-button'));

    const startButton = await waitFor(() => getByTestId('start-task-button'));
    fireEvent.press(startButton);

    expect((globalThis as any).taskTimer.start).toHaveBeenCalled();
  });

  it('calls stop function when Cancel Task is pressed', async () => {
    const { getByTestId } = render(<LeftDrawer />);

    fireEvent.press(getByTestId('drawer-button'));

    const cancelButton = await waitFor(() => getByTestId('cancel-task-button'));
    fireEvent.press(cancelButton);

    expect((globalThis as any).taskTimer.stop).toHaveBeenCalled();
  });
});
