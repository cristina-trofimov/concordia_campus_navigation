import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FloorSelector } from '../src/components/FloorSelector';

// Need to mock these first before importing
jest.mock('../src/data/IndoorContext.tsx', () => ({
  useIndoor: jest.fn(),
}));

jest.mock('../src/components/IndoorMap.tsx', () => ({
  useIndoorFeatures: jest.fn(),
}));

jest.mock('../src/data/CoordsContext.tsx', () => ({
  useCoords: jest.fn(),
}));

// Mock AntDesign with a proper mock that returns a valid React element
jest.mock('@expo/vector-icons/AntDesign', () => {
  const React = require('react');
  return function MockAntDesign(props) {
    return React.createElement('mockAntDesign', props);
  };
});

// Import after mocking
import { useIndoor } from '../src/data/IndoorContext.tsx';
import { useIndoorFeatures } from '../src/components/IndoorMap.tsx';
import { useCoords } from '../src/data/CoordsContext.tsx';

describe('FloorSelector', () => {
  // Setup common mock values and functions
  const mockSetCurrentFloor = jest.fn();
  const mockSelectIndoorFeatures = jest.fn();
  const mockSetInFloorView = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useIndoor as jest.Mock).mockReturnValue({
      currentFloor: 'Floor 1',
      setCurrentFloor: mockSetCurrentFloor,
      inFloorView: true,
      floorList: ['Floor 1', 'Floor 2', 'Floor 3'],
      setInFloorView: mockSetInFloorView
    });
    
    (useIndoorFeatures as jest.Mock).mockReturnValue({
      selectIndoorFeatures: mockSelectIndoorFeatures,
    });

    (useCoords as jest.Mock).mockReturnValue({
      destinationCoords: null,
    });
  });

  test('renders correctly when inFloorView is true', () => {
    const { getByText } = render(<FloorSelector />);
    
    // Check that current floor is displayed
    expect(getByText('Floor 1')).toBeTruthy();
    // Check that dropdown icon is displayed
    expect(getByText('▼')).toBeTruthy();
  });

  test('does not render when inFloorView is false', () => {
    (useIndoor as jest.Mock).mockReturnValue({
      currentFloor: 'Floor 1',
      setCurrentFloor: mockSetCurrentFloor,
      inFloorView: false,
      floorList: ['Floor 1', 'Floor 2', 'Floor 3'],
      setInFloorView: mockSetInFloorView
    });
    
    const { toJSON } = render(<FloorSelector />);
    
    // The component should not render anything
    expect(toJSON()).toBeNull();
  });

  test('shows dropdown options when dropdown trigger is pressed', () => {
    const { getByText, queryByText } = render(<FloorSelector />);
    
    // Check dropdown is not visible initially
    expect(queryByText('Floor 2')).toBeNull();
    
    // Click the dropdown trigger
    fireEvent.press(getByText('▼'));
    
    // Check all floor options are displayed
    expect(queryByText('Floor 2')).toBeTruthy();
    expect(queryByText('Floor 3')).toBeTruthy();
  });

  test('selects a floor when option is pressed', () => {
    const { getByText } = render(<FloorSelector />);
    
    // Open dropdown
    fireEvent.press(getByText('▼'));
    
    // Select Floor 2
    fireEvent.press(getByText('Floor 2'));
    
    // Check if proper functions were called
    expect(mockSetCurrentFloor).toHaveBeenCalledWith('Floor 2');
    expect(mockSelectIndoorFeatures).toHaveBeenCalledWith(1); // Index 1 for "Floor 2"
  });

  test('closes dropdown after selecting a floor', () => {
    const { getByText, queryByText } = render(<FloorSelector />);
    
    // Open dropdown
    fireEvent.press(getByText('▼'));
    
    // Verify dropdown is open
    expect(queryByText('Floor 2')).toBeTruthy();
    
    // Select Floor 3
    fireEvent.press(getByText('Floor 3'));
    
    // Dropdown should be closed now
    expect(queryByText('Floor 2')).toBeNull();
  });

  test('toggles dropdown visibility when clicking trigger multiple times', () => {
    const { getByText, queryByText } = render(<FloorSelector />);
    
    // Initially closed
    expect(queryByText('Floor 2')).toBeNull();
    
    // First click - open
    fireEvent.press(getByText('▼'));
    expect(queryByText('Floor 2')).toBeTruthy();
    
    // Second click - close
    fireEvent.press(getByText('▼'));
    expect(queryByText('Floor 2')).toBeNull();
  });

  test('renders back button when destinationCoords is null', () => {
    const { getByTestId } = render(<FloorSelector />);
    
    // Find the AntDesign component by its name prop which should be 'arrowleft'
    const mockIcon = getByTestId('back-button');
    expect(mockIcon).toBeTruthy();
  });

  test('back button not rendered when destinationCoords is present', () => {
    (useCoords as jest.Mock).mockReturnValue({
      destinationCoords: { latitude: 0, longitude: 0 },
    });
    
    const { queryByTestId } = render(<FloorSelector />);
    
    // Back button should not be present
    expect(queryByTestId('back-button')).toBeNull();
  });

  test('back button sets inFloorView to false when pressed', () => {
    // Use getByTestId to find the back button wrapper
    const { getByTestId } = render(<FloorSelector />);
    
    // Find the back button by testID and press it
    const backButton = getByTestId('back-button-container');
    fireEvent.press(backButton);
    
    // Check if setInFloorView was called with false
    expect(mockSetInFloorView).toHaveBeenCalledWith(false);
  });
});