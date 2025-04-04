import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RoomSearchBar } from '../src/components/RoomSearchBar';
import { useIndoor } from '../src/data/IndoorContext';
import { useCoords } from '../src/data/CoordsContext';
import { useFloorSelection } from '../src/components/FloorSelector';
import { featureMap } from '../src/components/IndoorMap';
import { buildingFloorAssociations } from '../src/data/buildingFloorAssociations';
import { fixedBuildingFeatures } from '../src/components/BuildingCoordinates';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';

// Mock the dependencies
jest.mock('../src/data/IndoorContext');
jest.mock('../src/data/CoordsContext');
jest.mock('../src/components/FloorSelector');
jest.mock('@turf/boolean-point-in-polygon');
jest.mock('@turf/helpers');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock the imported modules
jest.mock('../src/components/IndoorMap', () => ({
  featureMap: {
    'building1_floor1': [
      {
        properties: {
          indoor: 'room',
          ref: 'Room101',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[1, 2], [3, 4], [5, 6], [1, 2]]]
        }
      },
      {
        properties: {
          indoor: 'room',
          ref: 'Room102',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[[7, 8], [9, 10], [11, 12], [7, 8]]]
        }
      }
    ],
  },
  floorNameFormat: jest.fn((floor) => `Floor ${floor}`)
}));

jest.mock('../src/data/buildingFloorAssociations', () => ({
  buildingFloorAssociations: [
    {
      buildingID: 'building1',
      floor: '1',
      component: 'building1_floor1'
    }
  ]
}));

jest.mock('../src/components/BuildingCoordinates', () => ({
  fixedBuildingFeatures: [
    {
      properties: { id: 'building1', name: 'Test Building' },
      geometry: {
        type: 'Polygon',
        coordinates: [[]]
      }
    }
  ]
}));

describe('RoomSearchBar Component', () => {
  const mockSetOriginRoom = jest.fn();
  const mockSetDestinationRoom = jest.fn();
  const mockHandleSelectFloor = jest.fn();
  const mockLocation = { latitude: 35.123, longitude: -120.456 };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    (useIndoor as jest.Mock).mockReturnValue({
      setOriginRoom: mockSetOriginRoom,
      setDestinationRoom: mockSetDestinationRoom
    });
    
    (useCoords as jest.Mock).mockReturnValue({
      highlightedBuilding: {
        properties: { id: 'building1' }
      }
    });
    
    (useFloorSelection as jest.Mock).mockReturnValue({
      handleSelectFloor: mockHandleSelectFloor
    });
    
    (point as jest.Mock).mockImplementation((coords) => ({ coordinates: coords }));
    (booleanPointInPolygon as jest.Mock).mockReturnValue(true);
  });

  test('renders correctly with given props', () => {
    const { getByPlaceholderText } = render(
      <RoomSearchBar
        location={mockLocation}
        placeholder="Search rooms"
        searchType="origin"
      />
    );
    
    expect(getByPlaceholderText('Search rooms')).toBeTruthy();
  });

  test('does not render when building is not found', () => {
    (booleanPointInPolygon as jest.Mock).mockReturnValue(false);
    
    const { queryByPlaceholderText } = render(
      <RoomSearchBar
        location={mockLocation}
        placeholder="Search rooms"
        searchType="origin"
      />
    );
    
    expect(queryByPlaceholderText('Search rooms')).toBeNull();
  });

  test('shows suggestions when typing', async () => {
    const { getByPlaceholderText, findByText } = render(
      <RoomSearchBar
        location={mockLocation}
        placeholder="Search rooms"
        searchType="origin"
      />
    );
    
    const input = getByPlaceholderText('Search rooms');
    fireEvent.changeText(input, 'Room');
    
    const suggestion = await findByText('Room101');
    expect(suggestion).toBeTruthy();
  });

  test('selects a room and updates origin when suggestion is pressed', async () => {
    const { getByPlaceholderText, findByText } = render(
      <RoomSearchBar
        location={mockLocation}
        placeholder="Search rooms"
        searchType="origin"
      />
    );
    
    const input = getByPlaceholderText('Search rooms');
    fireEvent.changeText(input, 'Room');
    
    const suggestion = await findByText('Room101');
    fireEvent.press(suggestion);
    
    // Check that the origin room was set
    expect(mockSetOriginRoom).toHaveBeenCalledWith(expect.objectContaining({
      ref: 'Room101',
      floor: '1',
      component: 'building1_floor1'
    }));
    
    // Check that the floor was selected
    expect(mockHandleSelectFloor).toHaveBeenCalledWith('Floor 1');
  });

  test('selects a room and updates destination when suggestion is pressed', async () => {
    const { getByPlaceholderText, findByText } = render(
      <RoomSearchBar
        location={mockLocation}
        placeholder="Search rooms"
        searchType="destination"
      />
    );
    
    const input = getByPlaceholderText('Search rooms');
    fireEvent.changeText(input, 'Room');
    
    const suggestion = await findByText('Room101');
    fireEvent.press(suggestion);
    
    // Check that the destination room was set
    expect(mockSetDestinationRoom).toHaveBeenCalledWith(expect.objectContaining({
      ref: 'Room101',
      floor: '1',
      component: 'building1_floor1'
    }));
  });

  test('uses defaultValue when provided', () => {
    const { queryByDisplayValue } = render(
      <RoomSearchBar
        location={mockLocation}
        placeholder="Search rooms"
        searchType="origin"
        defaultValue="DefaultRoom"
      />
    );
    
    expect(queryByDisplayValue('DefaultRoom')).toBeTruthy();
  });

  test('does not select floor if highlighted building is different from location building', async () => {
    (useCoords as jest.Mock).mockReturnValue({
      highlightedBuilding: {
        properties: { id: 'different_building' }
      }
    });
    
    const { getByPlaceholderText, findByText } = render(
      <RoomSearchBar
        location={mockLocation}
        placeholder="Search rooms"
        searchType="origin"
      />
    );
    
    const input = getByPlaceholderText('Search rooms');
    fireEvent.changeText(input, 'Room');
    
    const suggestion = await findByText('Room101');
    fireEvent.press(suggestion);
    
    // The room should be set
    expect(mockSetOriginRoom).toHaveBeenCalled();
    
    // But the floor should not be selected because buildings don't match
    expect(mockHandleSelectFloor).not.toHaveBeenCalled();
  });
});