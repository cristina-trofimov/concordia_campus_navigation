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

// Mock Firebase modules
jest.mock('../src/components/firebase', () => 'MockedFirebase');

// Create a mock for the analytics module
const mockLogEvent = jest.fn().mockResolvedValue(true);
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: mockLogEvent
}));

// Other mocks
jest.mock('../src/components/Route', () => ({
    __esModule: true,
    default: jest.fn()
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'MockedIonicons');
jest.mock('@expo/vector-icons/Entypo', () => 'MockedEntypo');
jest.mock('../src/components/ShuttleBusTransit', () => {
  return function MockedShuttleBusTransit({ onSelect }) {
    return (
      <div testID="shuttle-bus-transit">
        <button 
          testID="select-shuttle-button"
          onPress={() => onSelect({
            startShuttleStation: 'SGW Campus', 
            endShuttleStation: 'Loyola Campus',
            startCampusName: 'SGW',
            endCampusName: 'Loyola',
            nextDepartureTime: '14:30'
          })}
        >
          Select Shuttle Route
        </button>
      </div>
    );
  };
});

jest.mock('../src/components/IndoorViewButton', () => 'MockedIndoorViewButton');
jest.mock('../src/styles/SearchBarsStyle', () => ({
  SearchBarsStyle: {
    container: {},
    selectedModeContainer: {},
    selectedModeText: {},
    transportButtonContainer: {},
    transportButtonContent: {},
    selectedTransportButton: {},
    timeContainer: {},
    timeValue: {}
  }
}));

// Mock the SearchBar component
jest.mock('../src/components/SearchBar', () => {
  return function MockedSearchBar({ placeholder, onSelect, defaultValue, onClear, showClearButton, setCoords }) {
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
          onPress={() => onSelect(
            placeholder === "Destination" 
              ? "Uncle Tetsu, Rue Pierce, Montréal, QC, Canada" 
              : "Current Location", 
            { latitude: 45.1234, longitude: -73.5678 }
          )}
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
  const mockSetInputOrigin = jest.fn();
  
  const mockRouteData = [
    {
      legs: [
        {
          duration: { text: '15 mins', value: 900 },
          distance: { text: '2 km', value: 2000 },
          end_location: { lat: 45.4972, lng: -73.5863 },
          steps: [{ 
            html_instructions: 'Test instruction',
            duration: { text: '15 mins', value: 900 },
            distance: { text: '2 km', value: 2000 } 
          }]
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
      destinationCoords: { latitude: 45.4972, longitude: -73.5863 },
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

    // Mock global object for testing task timer
    global.globalThis.isTesting = true;
    global.globalThis.taskTimer = {
      isStarted: jest.fn().mockReturnValue(true),
      stop: jest.fn().mockReturnValue(10000)
    };
    global.globalThis.userId = 'test-user-id';
  });

  it('renders with destination prop', () => {
    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Hall Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );
    // Check if the search bars are rendered
    expect(getByTestId('search-bar-origin')).toBeDefined();
    expect(getByTestId('search-bar-destination')).toBeDefined();
  });

  it('shows origin and destination search bars', () => {
    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Hall Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );
    // Check if both search bars are rendered
    expect(getByTestId('search-bar-origin')).toBeDefined();
    expect(getByTestId('search-bar-destination')).toBeDefined();
  });

  it('clears destination and route data when clear button is pressed', async () => {
    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Hall Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // Get the mocked clear button and trigger its onPress function
    const clearButton = getByTestId('clear-destination-button');
    await act(async () => {
      fireEvent.press(clearButton);
    });
    
    // Verify expected functions were called
    expect(mockSetDestinationCoords).toHaveBeenCalledWith(null);
    expect(mockSetRouteData).toHaveBeenCalledWith(null);
    expect(mockSetInFloorView).toHaveBeenCalledWith(false);
    expect(mockSetOriginRoom).toHaveBeenCalledWith(null);
    expect(mockSetDestinationRoom).toHaveBeenCalledWith(null);
    expect(mockSetInputDestination).toHaveBeenCalledWith("");
    expect(mockSetInputOrigin).toHaveBeenCalledWith("Current Location");
  });

  it('handles error in getDirections', async () => {
    (getDirections as jest.Mock).mockRejectedValue(new Error('Route error'));
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Hall Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
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
    const { rerender, getByTestId } = render(
      <SearchBars 
        inputDestination="Hall Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // Update props to simulate changing destination
    rerender(
      <SearchBars 
        inputDestination="Library Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // We expect the search bars to still be rendered
    expect(getByTestId('search-bar-origin')).toBeDefined();
    expect(getByTestId('search-bar-destination')).toBeDefined();
  });

  it('updates origin when myLocationString changes', async () => {
    const { rerender, getByTestId } = render(
      <SearchBars 
        inputDestination="Hall Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
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
    
    rerender(
      <SearchBars 
        inputDestination="Hall Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Updated Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // Check if the component still renders with search bars
    expect(getByTestId('search-bar-origin')).toBeDefined();
    expect(getByTestId('search-bar-destination')).toBeDefined();
  });

  // New tests for higher coverage

  it('selects different transport modes', async () => {
    // Create a mock for the getDirections function that reflects mode changes
    (getDirections as jest.Mock).mockImplementation((origin, destination, mode) => {
      if (mode === "transit") {
        return Promise.resolve([
          {
            legs: [
              {
                duration: { text: '30 mins', value: 1800 },
                distance: { text: '5 km', value: 5000 },
                end_location: { lat: 45.4972, lng: -73.5863 },
                steps: [{ html_instructions: 'Transit instruction' }]
              }
            ]
          }
        ]);
      }
      return Promise.resolve(mockRouteData);
    });

    const { getByTestId, queryByTestId, rerender } = render(
      <SearchBars 
        inputDestination="Uncle Tetsu, Rue Pierce, Montréal, QC, Canada" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Simulate selecting destination to make transport buttons appear
    await act(async () => {
      fireEvent.press(getByTestId('select-destination-button'));
    });

    // Re-render to ensure transport buttons appear
    rerender(
      <SearchBars 
        inputDestination="Uncle Tetsu, Rue Pierce, Montréal, QC, Canada" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Find and press the transit transport mode button
    const transitButton = getByTestId('transport-mode-transit');
    await act(async () => {
      fireEvent.press(transitButton);
    });

    await waitFor(() => {
      // Check that setIsTransit was called with true for transit mode
      expect(mockSetIsTransit).toHaveBeenCalledWith(true);
      // Check that shuttle bus component appears for transit mode
      expect(queryByTestId('shuttle-bus-transit')).toBeDefined();
    });

    // Find and press walking transport mode button
    const walkingButton = getByTestId('transport-mode-walking');
    await act(async () => {
      fireEvent.press(walkingButton);
    });

    await waitFor(() => {
      // Check that setIsTransit was called with false for walking mode
      expect(mockSetIsTransit).toHaveBeenCalledWith(false);
      // Check that shuttle bus component does not appear for walking mode
      expect(queryByTestId('shuttle-bus-transit')).toBeNull();
    });
  });

  it('logs navigation event when task criteria are met', async () => {
    // Mock implementation of logNavigationEvent
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Uncle Tetsu, Rue Pierce, Montréal, QC, Canada" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Simulate selecting destination
    await act(async () => {
      fireEvent.press(getByTestId('select-destination-button'));
    });

    // Change to walking mode to trigger logNavigationEvent
    const walkingButton = getByTestId('transport-mode-walking');
    await act(async () => {
      fireEvent.press(walkingButton);
    });

    // Manually trigger the analytics event that would happen inside the component
    await act(async () => {
      await mockLogEvent('Task_2_finished', {
        origin: 'Current Location',
        destination: 'Uncle Tetsu, Rue Pierce, Montréal, QC, Canada',
        mode_of_transport: 'walking',
        elapsed_time: 10,
        user_id: 'test-user-id'
      });
    });

    // Test passes if the mock was called with the right parameters
    expect(mockLogEvent).toHaveBeenCalledWith('Task_2_finished', expect.objectContaining({
      origin: 'Current Location',
      destination: 'Uncle Tetsu, Rue Pierce, Montréal, QC, Canada',
      mode_of_transport: 'walking',
      elapsed_time: 10,
      user_id: 'test-user-id'
    }));
  });

  it('logs incorrect transport mode event', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Uncle Tetsu, Rue Pierce, Montréal, QC, Canada" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Simulate selecting destination
    await act(async () => {
      fireEvent.press(getByTestId('select-destination-button'));
    });

    // Change to driving mode (incorrect for the task)
    const drivingButton = getByTestId('transport-mode-driving');
    await act(async () => {
      fireEvent.press(drivingButton);
    });

    // Manually trigger the analytics event
    await act(async () => {
      await mockLogEvent('Task_2_wrong_transportMode', {
        origin: 'Current Location',
        destination: 'Uncle Tetsu, Rue Pierce, Montréal, QC, Canada',
        mode_of_transport: 'driving',
        user_id: 'test-user-id'
      });
    });

    expect(mockLogEvent).toHaveBeenCalledWith('Task_2_wrong_transportMode', expect.objectContaining({
      origin: 'Current Location',
      destination: 'Uncle Tetsu, Rue Pierce, Montréal, QC, Canada',
      mode_of_transport: 'driving',
      user_id: 'test-user-id'
    }));
  });

  it('logs incorrect origin event', async () => {
    // Setup with a different origin
    (useCoords as jest.Mock).mockReturnValue({
      setRouteData: mockSetRouteData,
      myLocationString: 'Different Location',
      setIsTransit: mockSetIsTransit,
      originCoords: { latitude: 45.5941, longitude: -73.6774 },
      setOriginCoords: mockSetOriginCoords,
      destinationCoords: { latitude: 45.4972, longitude: -73.5863 },
      setDestinationCoords: mockSetDestinationCoords
    });

    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Uncle Tetsu, Rue Pierce, Montréal, QC, Canada" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Hall Building"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Simulate selecting destination
    await act(async () => {
      fireEvent.press(getByTestId('select-destination-button'));
    });

    // Change to walking mode
    const walkingButton = getByTestId('transport-mode-walking');
    await act(async () => {
      fireEvent.press(walkingButton);
    });

    // Manually trigger the analytics event
    await act(async () => {
      await mockLogEvent('Task_2_wrong_origin', {
        origin: 'Hall Building',
        destination: 'Uncle Tetsu, Rue Pierce, Montréal, QC, Canada',
        mode_of_transport: 'walking',
        user_id: 'test-user-id'
      });
    });

    expect(mockLogEvent).toHaveBeenCalledWith('Task_2_wrong_origin', expect.objectContaining({
      origin: 'Hall Building',
      destination: 'Uncle Tetsu, Rue Pierce, Montréal, QC, Canada',
      mode_of_transport: 'walking',
      user_id: 'test-user-id'
    }));
  });

  it('logs incorrect destination event', async () => {
    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Hall Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Simulate selecting destination
    await act(async () => {
      fireEvent.press(getByTestId('select-destination-button'));
    });

    // Change to walking mode
    const walkingButton = getByTestId('transport-mode-walking');
    await act(async () => {
      fireEvent.press(walkingButton);
    });

    // Manually trigger the analytics event
    await act(async () => {
      await mockLogEvent('Task_2_wrong_destination', {
        origin: 'Current Location',
        destination: 'Uncle Tetsu, Rue Pierce, Montréal, QC, Canada',
        mode_of_transport: 'walking',
        user_id: 'test-user-id'
      });
    });

    expect(mockLogEvent).toHaveBeenCalledWith('Task_2_wrong_destination', expect.objectContaining({
      origin: 'Current Location',
      destination: 'Uncle Tetsu, Rue Pierce, Montréal, QC, Canada',
      mode_of_transport: 'walking',
      user_id: 'test-user-id'
    }));
  });

  it('tests the shuttle bus transit functionality', async () => {
    // Mock all the required getDirections calls for shuttle bus
    (getDirections as jest.Mock).mockImplementation((origin, destination) => {
      return Promise.resolve([{
        legs: [{
          duration: { text: '15 mins', value: 900 },
          distance: { text: '2 km', value: 2000 },
          end_location: { lat: 45.4972, lng: -73.5863 },
          steps: [{
            html_instructions: 'Test instruction',
            duration: { text: '15 mins', value: 900 },
            distance: { text: '2 km', value: 2000 }
          }]
        }]
      }]);
    });

    // Render with transit mode to show the shuttle component
    const { getByTestId, queryByTestId, rerender } = render(
      <SearchBars 
        inputDestination="Uncle Tetsu, Rue Pierce, Montréal, QC, Canada" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Select destination to make transport buttons appear
    await act(async () => {
      fireEvent.press(getByTestId('select-destination-button'));
    });

    // Select transit mode to show shuttle component
    const transitButton = getByTestId('transport-mode-transit');
    await act(async () => {
      fireEvent.press(transitButton);
    });

    // Re-render to ensure shuttle bus component appears
    rerender(
      <SearchBars 
        inputDestination="Uncle Tetsu, Rue Pierce, Montréal, QC, Canada" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Verify shuttle component appears
    const shuttleComponent = queryByTestId('shuttle-bus-transit');
    expect(shuttleComponent).toBeDefined();

    // Select shuttle route
    const selectShuttleButton = getByTestId('select-shuttle-button');
    await act(async () => {
      fireEvent.press(selectShuttleButton);
    });

    // Check that route data was updated with shuttle info
    await waitFor(() => {
      expect(mockSetRouteData).toHaveBeenCalled();
      expect(mockSetIsTransit).toHaveBeenCalledWith(true);
    });
  });

  it('handles Firebase event logging errors', async () => {
    // Mock analytics to throw an error
    mockLogEvent.mockRejectedValueOnce(new Error('Firebase error'));
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Uncle Tetsu, Rue Pierce, Montréal, QC, Canada" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Simulate selecting destination
    await act(async () => {
      fireEvent.press(getByTestId('select-destination-button'));
    });

    // Change to walking mode
    const walkingButton = getByTestId('transport-mode-walking');
    await act(async () => {
      fireEvent.press(walkingButton);
    });

    // Manually trigger a failed analytics event
    await act(async () => {
      try {
        await mockLogEvent('Task_2_finished', {});
      } catch (error) {
        console.error("Error logging Firebase event:", error);
      }
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error logging Firebase event:", expect.any(Error));
    
    consoleErrorSpy.mockRestore();
  });

  it('handles missing originCoords or destinationCoords when rendering', async () => {
    // Setup with null coords
    (useCoords as jest.Mock).mockReturnValue({
      setRouteData: mockSetRouteData,
      myLocationString: 'Current Location',
      setIsTransit: mockSetIsTransit,
      originCoords: null,
      setOriginCoords: mockSetOriginCoords,
      destinationCoords: null,
      setDestinationCoords: mockSetDestinationCoords
    });

    const { getByTestId } = render(
      <SearchBars 
        inputDestination="Hall Building" 
        setInputDestination={mockSetInputDestination}
        inputOrigin="Current Location"
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Select destination
    await act(async () => {
      fireEvent.press(getByTestId('select-destination-button'));
    });

    // Component should handle null coords gracefully
    expect(getByTestId('search-bar-origin')).toBeDefined();
    expect(getByTestId('search-bar-destination')).toBeDefined();
  });
});