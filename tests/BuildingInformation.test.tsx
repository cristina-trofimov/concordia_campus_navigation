import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BuildingInformation from '../src/components/BuildingInformation';

// Mock all required dependencies
// Mock Mapbox
jest.mock('@rnmapbox/maps', () => ({}));

// Mock the react-native-modal
jest.mock('react-native-modal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children, isVisible, onBackdropPress, onBackButtonPress }) => {
    if (!isVisible) return null;
    return (
      <View testID="modal">
        <View testID="backdrop" onTouchEnd={onBackdropPress} />
        <View testID="backButton" onTouchEnd={onBackButtonPress} />
        {children}
      </View>
    );
  };
});

// Mock Firebase Analytics
jest.mock('@react-native-firebase/analytics', () => {
  const analyticsLogEvent = jest.fn();
  return () => ({
    logEvent: analyticsLogEvent,
  });
});

// Mock the Icon component from react-native-elements
jest.mock('react-native-elements', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return {
    Icon: ({ name, type, size, color, ...props }) => (
      <TouchableOpacity testID={`icon-${name}-${type}`} {...props}>
        <Text>{name}</Text>
      </TouchableOpacity>
    )
  };
});

// Mock Expo vector icons
jest.mock('@expo/vector-icons/Entypo', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return function MockEntypo({ name, size, color, ...props }) {
    return (
      <TouchableOpacity testID={`entypo-icon-${name}`} {...props}>
        <Text>{name}</Text>
      </TouchableOpacity>
    );
  };
}, { virtual: true });

// Mock the IndoorViewButton component
jest.mock('../src/components/IndoorViewButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return ({ buildingId, onClose }) => (
    <TouchableOpacity testID={`indoor-view-button-${buildingId}`} onPress={onClose}>
      <Text>Indoor View</Text>
    </TouchableOpacity>
  );
});

// Mock useCoords with a custom module factory
const mockSetDestinationCoords = jest.fn();
const mockSetOriginCoords = jest.fn();
let mockDestinationCoords = null;

jest.mock('../src/data/CoordsContext', () => ({
  useCoords: () => ({
    setDestinationCoords: mockSetDestinationCoords,
    setOriginCoords: mockSetOriginCoords,
    destinationCoords: mockDestinationCoords
  })
}));

// Mock the IndoorContext
jest.mock('../src/data/IndoorContext', () => ({
  useIndoor: () => ({
    inFloorView: false,
    setInFloorView: jest.fn()
  })
}));

describe('BuildingInformation Component', () => {
  const mockOnClose = jest.fn();
  const mockSetInputDestination = jest.fn();
  const mockSetInputOrigin = jest.fn();
  const mockBuildingLocation = {
    title: 'Test Building',
    description: 'This is a test description',
    coordinates: [123.456, 78.910], // Add coordinates for full coverage
    buildingInfo: {
      photo: 'https://example.com/photo.jpg',
      address: '123 Test Street',
      departments: ['Department 1', 'Department 2'],
      services: ['Service 1', 'Service 2']
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDestinationCoords = null;
  });

  test('renders correctly when visible with full building information', () => {
    const { getByText, getByTestId } = render(
      <BuildingInformation 
        isVisible={true} 
        onClose={mockOnClose} 
        buildingLocation={mockBuildingLocation}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );

    // Check if modal is rendered
    expect(getByTestId('modal')).toBeTruthy();
    
    // Check if title is displayed
    expect(getByText('Test Building')).toBeTruthy();
    
    // Check if description is displayed
    expect(getByText('This is a test description')).toBeTruthy();
    
    // Check if address is displayed
    expect(getByText('123 Test Street')).toBeTruthy();
    
    // Check if departments are displayed
    expect(getByText('Departments:')).toBeTruthy();
    expect(getByText('Department 1')).toBeTruthy();
    expect(getByText('Department 2')).toBeTruthy();
    
    // Check if services are displayed
    expect(getByText('Services:')).toBeTruthy();
    expect(getByText('Service 1')).toBeTruthy();
    expect(getByText('Service 2')).toBeTruthy();
    
    // Check indoor view button is rendered
    expect(getByTestId('indoor-view-button-Test')).toBeTruthy();
  });

  test('does not render when not visible', () => {
    const { queryByTestId } = render(
      <BuildingInformation 
        isVisible={false} 
        onClose={mockOnClose} 
        buildingLocation={mockBuildingLocation}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // Modal should not be rendered
    expect(queryByTestId('modal')).toBeNull();
  });

  test('calls onClose when backdrop is pressed', () => {
    const { getByTestId } = render(
      <BuildingInformation 
        isVisible={true} 
        onClose={mockOnClose} 
        buildingLocation={mockBuildingLocation}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    fireEvent(getByTestId('backdrop'), 'touchEnd');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when back button is pressed', () => {
    const { getByTestId } = render(
      <BuildingInformation 
        isVisible={true} 
        onClose={mockOnClose} 
        buildingLocation={mockBuildingLocation}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    fireEvent(getByTestId('backButton'), 'touchEnd');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('handles directions button press correctly', () => {
    const { getByTestId } = render(
      <BuildingInformation 
        isVisible={true} 
        onClose={mockOnClose} 
        buildingLocation={mockBuildingLocation}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // Find the directions icon and press it
    const directionsIcon = getByTestId('icon-directions-material');
    fireEvent.press(directionsIcon);
    
    // Check that setInputDestination was called with the correct address
    expect(mockSetInputDestination).toHaveBeenCalledWith(mockBuildingLocation.buildingInfo.address);
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles origin button press correctly when destination is set', () => {
    // Set destinationCoords to a non-null value for this test
    mockDestinationCoords = { latitude: 45.123, longitude: -73.456 };
    
    const { getByTestId } = render(
      <BuildingInformation 
        isVisible={true} 
        onClose={mockOnClose} 
        buildingLocation={mockBuildingLocation}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // Find the location icon and press it
    const locationIcon = getByTestId('entypo-icon-location');
    fireEvent.press(locationIcon);
    
    // Check that setInputOrigin was called with the correct address
    expect(mockSetInputOrigin).toHaveBeenCalledWith(mockBuildingLocation.buildingInfo.address);
    
    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles missing building location data gracefully', () => {
    const { queryByText } = render(
      <BuildingInformation 
        isVisible={true} 
        onClose={mockOnClose} 
        buildingLocation={null}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // None of these should throw errors, but they shouldn't display anything
    expect(queryByText('Departments:')).toBeNull();
    expect(queryByText('Services:')).toBeNull();
  });

  test('handles partial building information data gracefully', () => {
    const partialData = {
      title: 'Partial Building',
      description: 'Partial description',
      coordinates: null, // Test with null coordinates
      buildingInfo: {
        address: '456 Partial Street',
        // No photo, departments or services
      }
    };
    
    const { queryByText, getByText } = render(
      <BuildingInformation 
        isVisible={true} 
        onClose={mockOnClose} 
        buildingLocation={partialData}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // Should display what we have
    expect(getByText('Partial Building')).toBeTruthy();
    expect(getByText('Partial description')).toBeTruthy();
    expect(getByText('456 Partial Street')).toBeTruthy();
    
    // Should not display what we don't have
    expect(queryByText('Departments:')).toBeNull();
    expect(queryByText('Services:')).toBeNull();
  });

  test('handles indoor view button correctly', () => {
    const { getByTestId } = render(
      <BuildingInformation 
        isVisible={true} 
        onClose={mockOnClose} 
        buildingLocation={mockBuildingLocation}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    const indoorButton = getByTestId('indoor-view-button-Test');
    fireEvent.press(indoorButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  test('logs event when setting H Henry F. Hall Building as destination', () => {
    // Mock for stopTimerAndLogEvent
    global.isTesting = true;
    global.taskTimer = {
      isStarted: jest.fn().mockReturnValue(true),
      stop: jest.fn().mockReturnValue(30000) // Return 30 seconds
    };
    global.userId = 'test-user';
    
    const analyticsModule = require('@react-native-firebase/analytics');
    const analyticsLogEvent = analyticsModule().logEvent;
    
    const hallBuilding = {
      title: 'H Henry F. Hall Building',
      description: 'Hall Building description',
      coordinates: [123.456, 78.910],
      buildingInfo: {
        address: '1455 De Maisonneuve Blvd. W.',
        departments: [],
        services: []
      }
    };
    
    const { getByTestId } = render(
      <BuildingInformation 
        isVisible={true} 
        onClose={mockOnClose} 
        buildingLocation={hallBuilding}
        setInputDestination={mockSetInputDestination}
        setInputOrigin={mockSetInputOrigin}
      />
    );
    
    // Find the directions icon and press it
    const directionsIcon = getByTestId('icon-directions-material');
    fireEvent.press(directionsIcon);
    
    // Check that the analytics event was logged
    expect(analyticsLogEvent).toHaveBeenCalledWith('Task_1_finished', {
      building_name: 'H Henry F. Hall Building',
      elapsed_time: 30,
      user_id: 'test-user'
    });
  });
});