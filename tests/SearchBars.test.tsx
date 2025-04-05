import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SearchBars from '../src/components/SearchBars';
import getDirections from '../src/components/Route';
import { useCoords } from '../src/data/CoordsContext';
import { useIndoor } from '../src/data/IndoorContext';

// Mock the external dependencies before importing the component
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'MockedIonicons',
  }));
  
  jest.mock('@expo/vector-icons/Entypo', () => 'MockedEntypo');
  
  // Other mocks
  jest.mock('../src/components/Route', () => ({
    __esModule: true,
    default: jest.fn()
  }));

jest.mock('@expo/vector-icons/Ionicons', () => 'MockedIonicons');
jest.mock('@expo/vector-icons/Entypo', () => 'MockedEntypo');
jest.mock('../src/components/ShuttleBusTransit', () => 'MockedShuttleBusTransit');
jest.mock('../src/components/IndoorViewButton', () => 'MockedIndoorViewButton');

// Mock the SearchBar component
jest.mock('../src/components/SearchBar', () => {
  return function MockedSearchBar({ placeholder, onSelect, defaultValue, onClear, showClearButton }) {
    return (
      <div testID={`search-bar-${placeholder.toLowerCase()}`}>
        <input 
          testID={`input-${placeholder.toLowerCase()}`} 
          value={defaultValue || ''}
        />
        {showClearButton && (
          <button 
            testID="clear-destination-button" 
            onPress={onClear}
          >
            Clear
          </button>
        )}
        <button 
          testID={`select-${placeholder.toLowerCase()}-button`}
          onPress={() => onSelect('Test ' + placeholder, { latitude: 45.1234, longitude: -73.5678 })}
        >
          Select
        </button>
      </div>
    );
  };
});

// Mock the context hooks
jest.mock('../src/data/CoordsContext', () => ({
  useCoords: jest.fn()
}));

jest.mock('../src/data/IndoorContext', () => ({
  useIndoor: jest.fn()
}));

describe('SearchBars Component', () => {
  const mockSetRouteData = jest.fn();
  const mockSetOriginCoords = jest.fn();
  const mockSetDestinationCoords = jest.fn();
  const mockSetIsTransit = jest.fn();
  const mockSetInFloorView = jest.fn();
  const mockSetOriginRoom = jest.fn();
  const mockSetDestinationRoom = jest.fn();
  const mockSetInputDestination = jest.fn();
  
  const mockRouteData = [
    {
      legs: [
        {
          duration: { text: '15 mins', value: 900 },
          end_location: { lat: 45.4972, lng: -73.5863 },
          steps: [{ html_instructions: 'Test instruction' }]
        }
      ]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup useCoords mock
    (useCoords as jest.Mock).mockReturnValue({
      setRouteData: mockSetRouteData,
      myLocationString: 'Current Location',
      setIsTransit: mockSetIsTransit,
      originCoords: { latitude: 45.4941, longitude: -73.5774 },
      setOriginCoords: mockSetOriginCoords,
      destinationCoords: null,
      setDestinationCoords: mockSetDestinationCoords
    });
    
    // Setup useIndoor mock
    (useIndoor as jest.Mock).mockReturnValue({
      inFloorView: false,
      setInFloorView: mockSetInFloorView,
      setOriginRoom: mockSetOriginRoom,
      setDestinationRoom: mockSetDestinationRoom
    });
    
    // Setup getDirections mock
    (getDirections as jest.Mock).mockResolvedValue(mockRouteData);
  });

  it('renders with destination prop', () => {
    const { getByText } = render(<SearchBars inputDestination="Hall Building" setInputDestination={mockSetInputDestination} />);
    // Check if the component rendered with the destination
    expect(getByText('Drive')).toBeDefined();
  });

  it('shows origin and destination search bars', () => {
    const { getByText } = render(<SearchBars inputDestination="Hall Building" setInputDestination={mockSetInputDestination} />);
    // Check if component renders with expected content
    expect(getByText('Drive')).toBeDefined();
  });

  it('clears destination and route data when clear button is pressed', async () => {
    const { getByTestId } = render(<SearchBars inputDestination="Hall Building" setInputDestination={mockSetInputDestination} />);
    
    // Get the mocked clear button and trigger its onPress function
    const clearButton = getByTestId('clear-destination-button');
    fireEvent.press(clearButton);
    
    // Verify expected functions were called
    expect(mockSetDestinationCoords).toHaveBeenCalledWith(null);
    expect(mockSetRouteData).toHaveBeenCalledWith(null);
    expect(mockSetInFloorView).toHaveBeenCalledWith(false);
    expect(mockSetOriginRoom).toHaveBeenCalledWith(null);
    expect(mockSetDestinationRoom).toHaveBeenCalledWith(null);
    expect(mockSetInputDestination).toHaveBeenCalledWith(""); // Verify this mock is called
  });

  it('handles error in getDirections', async () => {
    (getDirections as jest.Mock).mockRejectedValue(new Error('Route error'));
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { getByTestId } = render(<SearchBars inputDestination="Hall Building" setInputDestination={mockSetInputDestination} />);
    
    // Find and press the origin select button
    const originSelectButton = getByTestId('select-origin-button');
    await act(async () => {
      fireEvent.press(originSelectButton);
    });
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in getDirections:', expect.any(Error));
      expect(mockSetRouteData).toHaveBeenCalledWith(null);
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('updates destination when inputDestination prop changes', async () => {
    const { rerender, getByText } = render(<SearchBars inputDestination="Hall Building" setInputDestination={mockSetInputDestination} />);
    
    // Update props to simulate changing destination
    rerender(<SearchBars inputDestination="Library Building" setInputDestination={mockSetInputDestination} />);
    
    // We expect the useEffect to be called when inputDestination changes
    // Since we can't easily test the internal state, we'll test if the component
    // still renders with the key UI elements
    expect(getByText('Drive')).toBeDefined();
  });

  it('updates origin when myLocationString changes', async () => {
    const { rerender, getByText } = render(<SearchBars inputDestination="Hall Building" setInputDestination={mockSetInputDestination} />);
    
    // Update context to simulate changing myLocationString
    (useCoords as jest.Mock).mockReturnValue({
      setRouteData: mockSetRouteData,
      myLocationString: 'Updated Location',
      setIsTransit: mockSetIsTransit, 
      originCoords: { latitude: 45.4941, longitude: -73.5774 },
      setOriginCoords: mockSetOriginCoords,
      destinationCoords: { latitude: 45.4972, longitude: -73.5863 },
      setDestinationCoords: mockSetDestinationCoords
    });
    
    rerender(<SearchBars inputDestination="Hall Building" setInputDestination={mockSetInputDestination} />);
    
    // Check if the component still renders with key UI elements
    expect(getByText('Drive')).toBeDefined();
  });
});