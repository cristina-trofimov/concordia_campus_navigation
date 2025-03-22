import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ToggleButton from '../src/components/ToggleButton';

// Mock the required dependencies
jest.mock('@rnmapbox/maps', () => ({
  MapView: 'MapView',
}));

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
    
    // The implementation assumes SGW is the active label when isSGW is true
    // Note: This is a bit of a fragile test as it assumes knowledge of the component styling
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
    
    // The implementation assumes Loyola is the active label when isSGW is false
    expect(loyolaText.props.style.some(style => style.fontWeight === 'bold')).toBeTruthy();
    expect(sgwText.props.style.some(style => style.fontWeight !== 'bold')).toBeTruthy();
  });

  it('calls onCampusChange when the toggle is pressed', () => {
    const { getByText } = render(
      <ToggleButton
        mapRef={mockMapRef}
        sgwCoords={mockSgwCoords}
        loyolaCoords={mockLoyolaCoords}
        onCampusChange={mockOnCampusChange}
      />
    );

    // Instead of using testID, we'll use the text content to find the touchable area
    // For this test, let's press on the "Loyola" text to toggle from SGW to Loyola
    const loyolaText = getByText('Loyola');
    fireEvent.press(loyolaText);
    
    // onCampusChange should be called with false since we're toggling from SGW (true) to Loyola (false)
    expect(mockOnCampusChange).toHaveBeenCalledWith(false);
  });

  it('toggles between SGW and Loyola when pressed multiple times', () => {
    const { getByText } = render(
      <ToggleButton
        mapRef={mockMapRef}
        sgwCoords={mockSgwCoords}
        loyolaCoords={mockLoyolaCoords}
        onCampusChange={mockOnCampusChange}
        initialCampus={true} // Start with SGW
      />
    );

    // Use the text elements to trigger presses
    const sgwText = getByText('SGW');
    const loyolaText = getByText('Loyola');
    
    // First press: SGW -> Loyola (press Loyola text)
    fireEvent.press(loyolaText);
    expect(mockOnCampusChange).toHaveBeenLastCalledWith(false);
    
    // Second press: Loyola -> SGW (press SGW text)
    fireEvent.press(sgwText);
    expect(mockOnCampusChange).toHaveBeenLastCalledWith(true);
    
    // Third press: SGW -> Loyola (press Loyola text again)
    fireEvent.press(loyolaText);
    expect(mockOnCampusChange).toHaveBeenLastCalledWith(false);
    
    // Check total number of calls
    expect(mockOnCampusChange).toHaveBeenCalledTimes(3);
  });
});