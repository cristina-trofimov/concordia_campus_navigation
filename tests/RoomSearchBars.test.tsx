import { render, fireEvent } from '@testing-library/react-native';
import { RoomSearchBars } from '../src/components/RoomSearchBars';
import { useCoords } from '../src/data/CoordsContext';
import { useIndoor } from '../src/data/IndoorContext';
import React from 'react';

// Mock the context hooks
jest.mock('../src/data/CoordsContext', () => ({
  useCoords: jest.fn()
}));

jest.mock('../src/data/IndoorContext', () => ({
  useIndoor: jest.fn()
}));

// Mock React useState hook
const mockSetState = jest.fn();
let originalUseState = React.useState;
jest.spyOn(React, 'useState').mockImplementation((initialValue) => {
  // Only override useState for selectedTransport and roomSearched
  if (initialValue === "" || initialValue === false) {
    return [true, mockSetState]; // Force roomSearched to be true in tests
  }
  // Use original implementation for other useState calls
  return originalUseState(initialValue);
});

// Mock expo vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: ({ name, size, color, onPress }) => (
    <mock-material-icon 
      testID={`material-icon-${name}`} 
      data-name={name} 
      data-size={size} 
      data-color={color}
      onPress={onPress}
    />
  )
}));

// Mock the RoomSearchBar component
jest.mock('../src/components/RoomSearchBar', () => jest.fn(
  (props) => {
    return (
      <mock-room-search-bar
        testID="room-search-bar"
        data-location={JSON.stringify(props.location)}
        data-placeholder={props.placeholder}
        data-searchtype={props.searchType}
        onPress={() => props.setRoomSearched && props.setRoomSearched(true)}
      />
    );
  }
));

describe('RoomSearchBars', () => {
  // Setup default mock values
  const mockSetIndoorTransport = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useCoords
    (useCoords as jest.Mock).mockReturnValue({
      originCoords: { lat: 45.497, lng: -73.579 },
      destinationCoords: { lat: 45.498, lng: -73.580 },
      myLocationCoords: { lat: 45.496, lng: -73.578 }
    });
    
    // Default mock implementation for useIndoor
    (useIndoor as jest.Mock).mockReturnValue({
      setIndoorTransport: mockSetIndoorTransport
    });
  });
  
  test('renders nothing when destinationCoords is null', () => {
    // Override the default mock to return null for destinationCoords
    (useCoords as jest.Mock).mockReturnValue({
      originCoords: { lat: 45.497, lng: -73.579 },
      destinationCoords: null,
      myLocationCoords: { lat: 45.496, lng: -73.578 }
    });
    
    const { queryByTestId } = render(<RoomSearchBars />);
    
    // Verify that no RoomSearchBar components are rendered
    expect(queryByTestId('room-search-bar')).toBeNull();
  });
  
  test('renders search bars when destinationCoords exists', () => {
    const { getAllByTestId } = render(<RoomSearchBars />);
    
    // Verify that two RoomSearchBar components are rendered
    const searchBars = getAllByTestId('room-search-bar');
    expect(searchBars).toHaveLength(2);
    
    // Verify that the first search bar has origin props
    expect(searchBars[0].props['data-searchtype']).toBe('origin');
    expect(searchBars[0].props['data-placeholder']).toBe('origin room');
    
    // Verify that the second search bar has destination props
    expect(searchBars[1].props['data-searchtype']).toBe('destination');
    expect(searchBars[1].props['data-placeholder']).toBe('destination room');
  });
  
  test('passes originCoords to the first RoomSearchBar', () => {
    const { getAllByTestId } = render(<RoomSearchBars />);
    
    const searchBars = getAllByTestId('room-search-bar');
    const locationData = JSON.parse(searchBars[0].props['data-location']);
    
    expect(locationData).toEqual({ lat: 45.497, lng: -73.579 });
  });
  
  test('passes myLocationCoords when originCoords is null', () => {
    // Override the default mock to return null for originCoords
    (useCoords as jest.Mock).mockReturnValue({
      originCoords: null,
      destinationCoords: { lat: 45.498, lng: -73.580 },
      myLocationCoords: { lat: 45.496, lng: -73.578 }
    });
    
    const { getAllByTestId } = render(<RoomSearchBars />);
    
    const searchBars = getAllByTestId('room-search-bar');
    const locationData = JSON.parse(searchBars[0].props['data-location']);
    
    expect(locationData).toEqual({ lat: 45.496, lng: -73.578 });
  });
  
  test('renders transport icons when destinationCoords exists', () => {
    const { getByTestId } = render(<RoomSearchBars />);
    
    // Check that all three icons are rendered with proper names
    expect(getByTestId('material-icon-stairs')).toBeTruthy();
    expect(getByTestId('material-icon-elevator')).toBeTruthy();
    expect(getByTestId('material-icon-escalator')).toBeTruthy();
  });
  
  test('sets indoor transport type when an icon is pressed', () => {
    const { getByTestId } = render(<RoomSearchBars />);
    
    // Get each icon by its testID
    const stairsIcon = getByTestId('material-icon-stairs');
    const elevatorIcon = getByTestId('material-icon-elevator');
    const escalatorIcon = getByTestId('material-icon-escalator');
    
    // Simulate clicking on stairs icon
    fireEvent.press(stairsIcon);
    expect(mockSetIndoorTransport).toHaveBeenCalledWith('stairs');
    
    // Simulate clicking on elevator icon
    fireEvent.press(elevatorIcon);
    expect(mockSetIndoorTransport).toHaveBeenCalledWith('elevator');
    
    // Simulate clicking on escalator icon
    fireEvent.press(escalatorIcon);
    expect(mockSetIndoorTransport).toHaveBeenCalledWith('escalator');
  });
  
  test('updates the selected transport state when an icon is pressed', () => {
    const { getByTestId } = render(<RoomSearchBars />);
    
    // Get the elevator icon
    const elevatorIcon = getByTestId('material-icon-elevator');
    
    // Simulate clicking on the elevator icon
    fireEvent.press(elevatorIcon);
    
    // Check that setIndoorTransport was called with 'elevator'
    expect(mockSetIndoorTransport).toHaveBeenCalledWith('elevator');
    expect(mockSetState).toHaveBeenCalledWith('elevator');
  });
  
  test('changes icon color when transport type is selected', () => {
    // Mock useState for selectedTransport specifically for this test
    const mockUseState = jest.fn().mockReturnValue(['stairs', mockSetState]);
    const originalUseState = React.useState;
    React.useState = mockUseState;
    
    const { getByTestId } = render(<RoomSearchBars />);
    
    // Now the stairs icon should have the selected color
    const stairsIcon = getByTestId('material-icon-stairs');
    expect(stairsIcon.props['data-color']).toBe('#912338');
    
    // Other icons should remain black
    const elevatorIcon = getByTestId('material-icon-elevator');
    expect(elevatorIcon.props['data-color']).toBe('black');
    
    // Restore original useState
    React.useState = originalUseState;
  });
});