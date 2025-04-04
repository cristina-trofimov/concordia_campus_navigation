import React from 'react';
import { render } from '@testing-library/react-native';
import { IndoorPointsOfInterest } from '../src/components/IndoorPointsOfInterest';
import { useIndoor } from '../src/data/IndoorContext';
import { PointsOfInterestMarkers } from '../src/components/PointsOfInterestMarkers';

// Mock the imported modules
jest.mock('../src/data/IndoorContext');
jest.mock('../src/components/PointsOfInterestMarkers', () => ({
  PointsOfInterestMarkers: jest.fn(() => null)
}));
jest.mock('@expo/vector-icons', () => ({
  FontAwesome5: () => 'FontAwesome5Icon',
  MaterialCommunityIcons: () => 'MaterialCommunityIcon',
  FontAwesome6: () => 'FontAwesome6Icon'
}));

describe('IndoorPointsOfInterest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render anything when inFloorView is false', () => {
    useIndoor.mockReturnValue({
      inFloorView: false,
      indoorFeatures: []
    });

    const { toJSON } = render(<IndoorPointsOfInterest />);
    expect(toJSON()).toBeNull();
    expect(PointsOfInterestMarkers).not.toHaveBeenCalled();
  });

  it('should not render anything when indoorFeatures is null', () => {
    useIndoor.mockReturnValue({
      inFloorView: true,
      indoorFeatures: null
    });

    const { toJSON } = render(<IndoorPointsOfInterest />);
    expect(toJSON()).toBeNull();
    expect(PointsOfInterestMarkers).not.toHaveBeenCalled();
  });

  it('should render all point of interest markers when inFloorView is true and indoorFeatures exist', () => {
    const mockIndoorFeatures = [
      { properties: { amenity: 'toilets' }, geometry: { type: 'Polygon' } },
      { properties: { highway: 'elevator' }, geometry: { type: 'Polygon' } },
      { properties: { escalators: 'yes' }, geometry: { type: 'Polygon' } },
      { properties: { highway: 'steps' }, geometry: { type: 'Polygon' } },
      { properties: { amenity: 'cafe' }, geometry: { type: 'Polygon' } }
    ];

    useIndoor.mockReturnValue({
      inFloorView: true,
      indoorFeatures: mockIndoorFeatures
    });

    render(<IndoorPointsOfInterest />);
    
    // Should call PointsOfInterestMarkers 5 times (for each type of POI)
    expect(PointsOfInterestMarkers).toHaveBeenCalledTimes(5);
    
    // Test first call for toilets
    expect(PointsOfInterestMarkers).toHaveBeenNthCalledWith(1, 
      expect.objectContaining({
        features: mockIndoorFeatures,
        iconColor: "#007AFF",
        iconSize: 23,
      }), 
      expect.anything()
    );
    
    // Test second call for elevators
    expect(PointsOfInterestMarkers).toHaveBeenNthCalledWith(2, 
      expect.objectContaining({
        features: mockIndoorFeatures,
        iconColor: "dark grey",
        iconSize: 28,
      }), 
      expect.anything()
    );
    
    // Test third call for escalators
    expect(PointsOfInterestMarkers).toHaveBeenNthCalledWith(3, 
      expect.objectContaining({
        features: mockIndoorFeatures,
        iconColor: "#B16200",
        iconSize: 35,
      }), 
      expect.anything()
    );
    
    // Test fourth call for stairs
    expect(PointsOfInterestMarkers).toHaveBeenNthCalledWith(4, 
      expect.objectContaining({
        features: mockIndoorFeatures,
        iconColor: "#8B4513",
        iconSize: 25,
      }), 
      expect.anything()
    );
    
    // Test fifth call for cafes
    expect(PointsOfInterestMarkers).toHaveBeenNthCalledWith(5, 
      expect.objectContaining({
        features: mockIndoorFeatures,
        iconColor: "#422B25",
        iconSize: 25,
      }), 
      expect.anything()
    );
  });

  it('should test the filter function for each POI type', () => {
    const mockIndoorFeatures = [
      { properties: { amenity: 'toilets' }, geometry: { type: 'Polygon' } },
      { properties: { highway: 'elevator' }, geometry: { type: 'Polygon' } },
      { properties: { escalators: 'yes' }, geometry: { type: 'Polygon' } },
      { properties: { highway: 'steps' }, geometry: { type: 'Polygon' } },
      { properties: { amenity: 'cafe' }, geometry: { type: 'Polygon' } }
    ];

    useIndoor.mockReturnValue({
      inFloorView: true,
      indoorFeatures: mockIndoorFeatures
    });

    render(<IndoorPointsOfInterest />);
    
    // Extract and test the filter function for toilets
    const toiletsFilterFn = PointsOfInterestMarkers.mock.calls[0][0].filter;
    expect(toiletsFilterFn(mockIndoorFeatures[0])).toBe(true);
    expect(toiletsFilterFn(mockIndoorFeatures[1])).toBe(false);
    
    // Extract and test the filter function for elevators
    const elevatorFilterFn = PointsOfInterestMarkers.mock.calls[1][0].filter;
    expect(elevatorFilterFn(mockIndoorFeatures[0])).toBe(false);
    expect(elevatorFilterFn(mockIndoorFeatures[1])).toBe(true);
    
    // Extract and test the filter function for escalators
    const escalatorFilterFn = PointsOfInterestMarkers.mock.calls[2][0].filter;
    expect(escalatorFilterFn(mockIndoorFeatures[0])).toBe(false);
    expect(escalatorFilterFn(mockIndoorFeatures[2])).toBe(true);
    
    // Extract and test the filter function for stairs
    const stairsFilterFn = PointsOfInterestMarkers.mock.calls[3][0].filter;
    expect(stairsFilterFn(mockIndoorFeatures[0])).toBe(false);
    expect(stairsFilterFn(mockIndoorFeatures[3])).toBe(true);
    
    // Extract and test the filter function for cafes
    const cafeFilterFn = PointsOfInterestMarkers.mock.calls[4][0].filter;
    expect(cafeFilterFn(mockIndoorFeatures[0])).toBe(false);
    expect(cafeFilterFn(mockIndoorFeatures[4])).toBe(true);
  });
});