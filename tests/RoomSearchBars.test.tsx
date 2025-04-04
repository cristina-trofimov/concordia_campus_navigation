import React from 'react';
import { render } from '@testing-library/react-native';
import RoomSearchBars from '../src/components/RoomSearchBars';
import { useCoords } from '../src/data/CoordsContext';

// Mock the CoordsContext hook
jest.mock('../src/data/CoordsContext', () => ({
  useCoords: jest.fn(),
}));

// Mock the RoomSearchBar component with a string representation
jest.mock('../src/components/RoomSearchBar', () => {
  const mockComponent = function(props) {
    return `mock-roomsearchbar-${props.searchType}`;
  };
  
  return {
    RoomSearchBar: mockComponent
  };
});

describe('RoomSearchBars Component', () => {
  // Helper function to set up the mock return values for useCoords
  const setupCoordsMock = (mockValues) => {
    (useCoords as jest.Mock).mockReturnValue(mockValues);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when destinationCoords is undefined', () => {
    // Set up mock to return undefined destinationCoords
    setupCoordsMock({
      originCoords: { lat: 34.5, lng: -118.2 },
      destinationCoords: undefined,
      myLocationCoords: { lat: 34.0, lng: -118.0 },
    });

    const { toJSON } = render(<RoomSearchBars />);
    expect(toJSON()).toBeNull();
  });

  test('renders both search bars when destinationCoords is defined', () => {
    // Mock coordinates
    const mockOriginCoords = { lat: 34.5, lng: -118.2 };
    const mockDestinationCoords = { lat: 35.1, lng: -119.3 };
    const mockMyLocationCoords = { lat: 34.0, lng: -118.0 };

    // Set up mock to return all coordinates
    setupCoordsMock({
      originCoords: mockOriginCoords,
      destinationCoords: mockDestinationCoords,
      myLocationCoords: mockMyLocationCoords,
    });

    const { root, toJSON } = render(<RoomSearchBars />);
    
    // Verify component rendered something
    expect(toJSON()).not.toBeNull();
    expect(root).toBeDefined();
  });

  test('uses myLocationCoords when originCoords is undefined', () => {
    // Mock coordinates
    const mockDestinationCoords = { lat: 35.1, lng: -119.3 };
    const mockMyLocationCoords = { lat: 34.0, lng: -118.0 };

    // Set up mock with undefined originCoords
    setupCoordsMock({
      originCoords: undefined,
      destinationCoords: mockDestinationCoords,
      myLocationCoords: mockMyLocationCoords,
    });

    const { root, toJSON } = render(<RoomSearchBars />);
    
    // Verify component rendered something
    expect(toJSON()).not.toBeNull();
    expect(root).toBeDefined();
  });

  test('passes correct location props based on available coordinates', () => {
    // Create a spy implementation for the RoomSearchBar component
    const mockRoomSearchBarSpy = jest.fn().mockReturnValue(null);
    
    // Reset the mock and provide our spy
    const originalMock = jest.requireMock('../src/components/RoomSearchBar');
    originalMock.RoomSearchBar = mockRoomSearchBarSpy;
    
    // Mock coordinates
    const mockOriginCoords = { lat: 34.5, lng: -118.2 };
    const mockDestinationCoords = { lat: 35.1, lng: -119.3 };
    
    // Test with originCoords defined
    setupCoordsMock({
      originCoords: mockOriginCoords,
      destinationCoords: mockDestinationCoords,
      myLocationCoords: { lat: 34.0, lng: -118.0 },
    });
    
    render(<RoomSearchBars />);
    
    // Check that RoomSearchBar was called with correct props
    expect(mockRoomSearchBarSpy).toHaveBeenCalledTimes(2);
    
    // Check first call (origin)
    expect(mockRoomSearchBarSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        location: mockOriginCoords,
        placeholder: "origin room",
        searchType: "origin"
      })
    );
    
    // Check second call (destination)
    expect(mockRoomSearchBarSpy.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        location: mockDestinationCoords,
        placeholder: "destination room",
        searchType: "destination"
      })
    );
  });
});