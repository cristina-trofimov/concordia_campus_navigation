import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FloorSelector } from '../src/components/FloorSelector';
import { useIndoor } from '../src/data/IndoorContext';
import { useIndoorFeatures } from '../src/components/IndoorMap';

// hopla
// Mock the hooks
jest.mock('../src/data/IndoorContext', () => ({
  useIndoor: jest.fn(),
}));

jest.mock('../src/components/IndoorMap', () => ({
  useIndoorFeatures: jest.fn(),
}));

describe('FloorSelector', () => {
  // Setup common mock values and functions
  const mockSetCurrentFloor = jest.fn();
  const mockSelectIndoorFeatures = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useIndoor as jest.Mock).mockReturnValue({
      currentFloor: 'Floor 1',
      setCurrentFloor: mockSetCurrentFloor,
      inFloorView: true,
      floorList: ['Floor 1', 'Floor 2', 'Floor 3'],
    });
    
    (useIndoorFeatures as jest.Mock).mockReturnValue({
      selectIndoorFeatures: mockSelectIndoorFeatures,
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
    });
    
    const { toJSON } = render(<FloorSelector />);
    
    // The component should not render anything
    expect(toJSON()).toBeNull();
  });

  test('shows dropdown options when dropdown trigger is pressed', () => {
    const { getByText, queryByText, getByTestId } = render(<FloorSelector />);
    
    // Add a testID to help identify the dropdown trigger in our component
    // Note: You would need to add this testID to the actual component
    // <TouchableOpacity testID="dropdown-trigger" ... >
    
    // Check dropdown is not visible initially
    expect(queryByText('Floor 2')).toBeNull();
    
    // Click the dropdown trigger - using the arrow icon to avoid ambiguity
    fireEvent.press(getByText('▼'));
    
    // Check all floor options are displayed
    expect(queryByText('Floor 2')).toBeTruthy();
    expect(queryByText('Floor 3')).toBeTruthy();
  });

  test('selects a floor when option is pressed', () => {
    const { getByText, queryByText } = render(<FloorSelector />);
    
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
    
    // First click - open (using arrow to avoid ambiguity)
    fireEvent.press(getByText('▼'));
    expect(queryByText('Floor 2')).toBeTruthy();
    
    // Second click - close (using arrow to avoid ambiguity)
    fireEvent.press(getByText('▼'));
    expect(queryByText('Floor 2')).toBeNull();
  });
});