import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ToggleButton from '../src/components/ToggleButton';

// Mock the required dependencies
jest.mock('@rnmapbox/maps', () => ({
  MapView: 'MapView',
}));

// Mock timers to handle animation timing
jest.useFakeTimers();

describe('ToggleButton', () => {
  const mockMapRef = { current: null };
  const mockSgwCoords = { latitude: 45.497, longitude: -73.578 };
  const mockLoyolaCoords = { latitude: 45.458, longitude: -73.638 };
  const mockOnCampusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <ToggleButton
        mapRef={mockMapRef}
        sgwCoords={mockSgwCoords}
        loyolaCoords={mockLoyolaCoords}
        onCampusChange={mockOnCampusChange}
      />
    );

    // Check if both campus labels are rendered
    expect(getByText('SGW')).toBeTruthy();
    expect(getByText('Loyola')).toBeTruthy();
  });

  it('initializes with SGW campus selected by default', () => {
    const { getByText } = render(
      <ToggleButton
        mapRef={mockMapRef}
        sgwCoords={mockSgwCoords}
        loyolaCoords={mockLoyolaCoords}
        onCampusChange={mockOnCampusChange}
      />
    );

    // Get the SGW text element and check its style
    const sgwText = getByText('SGW');
    const loyolaText = getByText('Loyola');
    
    expect(sgwText.props.style.some(style => style.fontWeight === 'bold')).toBeTruthy();
    expect(loyolaText.props.style.some(style => style.fontWeight !== 'bold')).toBeTruthy();
  });

  it('initializes with Loyola campus when initialCampus is false', () => {
    const { getByText } = render(
      <ToggleButton
        mapRef={mockMapRef}
        sgwCoords={mockSgwCoords}
        loyolaCoords={mockLoyolaCoords}
        onCampusChange={mockOnCampusChange}
        initialCampus={false}
      />
    );

    const sgwText = getByText('SGW');
    const loyolaText = getByText('Loyola');
    
    expect(loyolaText.props.style.some(style => style.fontWeight === 'bold')).toBeTruthy();
    expect(sgwText.props.style.some(style => style.fontWeight !== 'bold')).toBeTruthy();
  });

  it('calls onCampusChange when the toggle is pressed', async () => {
    const { getByText } = render(
      <ToggleButton
        mapRef={mockMapRef}
        sgwCoords={mockSgwCoords}
        loyolaCoords={mockLoyolaCoords}
        onCampusChange={mockOnCampusChange}
      />
    );

    const loyolaText = getByText('Loyola');
    
    // Wrap the event in act()
    await act(async () => {
      fireEvent.press(loyolaText);
      // Advance timers to complete any animations
      jest.runAllTimers();
    });
    
    expect(mockOnCampusChange).toHaveBeenCalledWith(false);
  });

  it('toggles between SGW and Loyola when pressed multiple times', async () => {
    const { getByText } = render(
      <ToggleButton
        mapRef={mockMapRef}
        sgwCoords={mockSgwCoords}
        loyolaCoords={mockLoyolaCoords}
        onCampusChange={mockOnCampusChange}
        initialCampus={true}
      />
    );

    const sgwText = getByText('SGW');
    const loyolaText = getByText('Loyola');
    
    // First press: SGW -> Loyola
    await act(async () => {
      fireEvent.press(loyolaText);
      jest.runAllTimers();
    });
    expect(mockOnCampusChange).toHaveBeenLastCalledWith(false);
    
    // Second press: Loyola -> SGW
    await act(async () => {
      fireEvent.press(sgwText);
      jest.runAllTimers();
    });
    expect(mockOnCampusChange).toHaveBeenLastCalledWith(true);
    
    // Third press: SGW -> Loyola
    await act(async () => {
      fireEvent.press(loyolaText);
      jest.runAllTimers();
    });
    expect(mockOnCampusChange).toHaveBeenLastCalledWith(false);
    
    expect(mockOnCampusChange).toHaveBeenCalledTimes(3);
  });
});