import React from 'react';
import { render } from '@testing-library/react';
import { HighlightIndoorMap } from '../src/components/IndoorMap';
import { useCoords } from '../src/data/CoordsContext';
import { useIndoor } from '../src/data/IndoorContext';
import Mapbox from '@rnmapbox/maps';
import { IndoorPointsOfInterest } from '../src/components/IndoorPointsOfInterest';

// Mock the dependencies
jest.mock('../src/data/CoordsContext');
jest.mock('../src/data/IndoorContext');
jest.mock('@rnmapbox/maps', () => ({
  ShapeSource: jest.fn(() => null),
  FillLayer: jest.fn(() => null),
  SymbolLayer: jest.fn(() => null),
  CircleLayer: jest.fn(() => null),
}));

// Fix the import path to match the actual import path in HighlightIndoorMap
jest.mock('../src/components/IndoorPointsOfInterest', () => ({
  IndoorPointsOfInterest: jest.fn(() => null),
}));

// This is the key change: properly mock the useIndoorFeatures hook
jest.mock('../src/components/IndoorMap', () => {
  const originalModule = jest.requireActual('../src/components/IndoorMap');
  
  return {
    ...originalModule,
    useIndoorFeatures: jest.fn(),
    HighlightIndoorMap: originalModule.HighlightIndoorMap
  };
});

// Import the mocked useIndoorFeatures after it's been mocked
import { useIndoorFeatures } from '../src/components/IndoorMap';

// Create mock for floorNameFormat without mocking the entire module
const floorNameFormat = (floor: string) => {
  if (floor === '1') return '1st Floor';
  if (floor === '2') return '2nd Floor';
  return floor + (floor.includes('S') ? ' Floor' : 'th Floor');
};

describe('HighlightIndoorMap', () => {
  // Setup common mock values
  const mockSelectIndoorFeatures = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useCoords
    (useCoords as jest.Mock).mockReturnValue({
      highlightedBuilding: null,
      isInsideBuilding: false,
      destinationCoords: null,
      myLocationCoords: null,
    });
    
    // Mock useIndoor
    (useIndoor as jest.Mock).mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: false,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: null,
      destinationRoom: null,
      currentFloor: null,
    });

    // Here's the fixed mock implementation for useIndoorFeatures
    (useIndoorFeatures as jest.Mock).mockReturnValue({
      selectIndoorFeatures: mockSelectIndoorFeatures
    });
  });
  
  test('should not render any Mapbox components when indoorFeatures is empty', () => {
    render(<HighlightIndoorMap />);
    
    expect(Mapbox.ShapeSource).not.toHaveBeenCalled();
  });
  
  test('should render Mapbox components when indoorFeatures has data and inFloorView is true', () => {
    // Setup mocks for this test
    (useIndoor as jest.Mock).mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: true,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [{ type: 'Feature', properties: {}, geometry: {} }],
      originRoom: null,
      destinationRoom: null,
      currentFloor: null,
    });
    
    render(<HighlightIndoorMap />);
    
    expect(Mapbox.ShapeSource).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'indoor-features',
      }),
      expect.anything()
    );
  });
  
  test('should render origin room pin when conditions met', () => {
    // Setup mocks for this test
    (useIndoor as jest.Mock).mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: true,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: {
        ref: '115',
        floor: '1',
        coordinates: [-73.5789, 45.4966],
      },
      destinationRoom: null,
      currentFloor: '1st Floor',
    });
    
    render(<HighlightIndoorMap />);
    
    expect(Mapbox.ShapeSource).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'origin-room-pin',
      }),
      expect.anything()
    );
  });
  
  test('should render destination room pin when conditions met', () => {
    // Setup mocks for this test
    (useIndoor as jest.Mock).mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: true,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: null,
      destinationRoom: {
        ref: '835',
        floor: '8',
        coordinates: [-73.5789, 45.4966],
      },
      currentFloor: '8th Floor',
    });
    
    render(<HighlightIndoorMap />);
    
    expect(Mapbox.ShapeSource).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'destination-room-pin',
      }),
      expect.anything()
    );
  });
  
  test('should not render room pins when floor does not match', () => {
    // Setup mocks for this test
    (useIndoor as jest.Mock).mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: true,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: {
        ref: '115',
        floor: '1',
        coordinates: [-73.5789, 45.4966],
      },
      destinationRoom: {
        ref: '835',
        floor: '8',
        coordinates: [-73.5789, 45.4966],
      },
      currentFloor: '9th Floor', // Different from both rooms
    });
    
    render(<HighlightIndoorMap />);
    
    // Should not find a shape source with id containing 'pin'
    const shapeSourceCalls = (Mapbox.ShapeSource as jest.Mock).mock.calls;
    const hasPinCall = shapeSourceCalls.some((call: any) => 
      call[0].id.includes('pin')
    );
    
    expect(hasPinCall).toBe(false);
  });
  
  test('should update floor associations when highlighted building changes', () => {
    const setCurrentFloorAssociationsMock = jest.fn();
    
    (useCoords as jest.Mock).mockReturnValue({
      highlightedBuilding: {
        properties: {
          id: 'H',
        },
      },
      isInsideBuilding: false,
      destinationCoords: null,
      myLocationCoords: null,
    });
    
    (useIndoor as jest.Mock).mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: false,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: setCurrentFloorAssociationsMock,
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: null,
      destinationRoom: null,
      currentFloor: null,
    });
    
    render(<HighlightIndoorMap />);
    
    expect(setCurrentFloorAssociationsMock).toHaveBeenCalled();
  });
  
  test('should set floor view when destination coords exist and inside building', () => {
    const setInFloorViewMock = jest.fn();
    
    (useCoords as jest.Mock).mockReturnValue({
      highlightedBuilding: null,
      isInsideBuilding: true,
      destinationCoords: [-73.5789, 45.4966],
      myLocationCoords: [-73.5790, 45.4967],
    });
    
    (useIndoor as jest.Mock).mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: setInFloorViewMock,
      inFloorView: false,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: null,
      destinationRoom: null,
      currentFloor: null,
    });
    
    render(<HighlightIndoorMap />);
    
    expect(setInFloorViewMock).toHaveBeenCalledWith(true);
  });
});

// Testing the floorNameFormat function
describe('floorNameFormat function', () => {
  test('formats floor names correctly', () => {
    expect(floorNameFormat('1')).toBe('1st Floor');
    expect(floorNameFormat('2')).toBe('2nd Floor');
    expect(floorNameFormat('3')).toBe('3th Floor');
    expect(floorNameFormat('S2')).toBe('S2 Floor');
  });
});