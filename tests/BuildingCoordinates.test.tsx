/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { HighlightBuilding, fixPolygonCoordinates, fixedBuildingFeatures } from '../src/components/BuildingCoordinates';
import * as turf from '@turf/turf';
import { useCoords } from "../src/data/CoordsContext";
import { useIndoor } from "../src/data/IndoorContext";
import { buildingFeatures } from '../src/data/buildingFeatures';

// Mock the necessary modules and context hooks
jest.mock('@rnmapbox/maps', () => ({
  ShapeSource: ({ children }) => <div data-testid="shape-source">{children}</div>,
  FillExtrusionLayer: () => <div data-testid="fill-extrusion-layer" />,
}));

jest.mock('@turf/turf', () => ({
  point: jest.fn(),
  polygon: jest.fn(),
  booleanPointInPolygon: jest.fn(),
}));

jest.mock('../src/data/CoordsContext');
jest.mock('../src/data/IndoorContext');
jest.mock('../src/data/buildingFeatures', () => ({
  buildingFeatures: [
    {
      id: 'building1',
      type: 'Feature',
      properties: {
        name: 'Test Building 1',
        height: 100,
        color: '#CCCCCC',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [1, 2],
            [3, 4],
            [5, 6],
            [1, 2]
          ]
        ]
      }
    },
    {
      id: 'building2',
      type: 'Feature',
      properties: {
        name: 'Test Building 2',
        height: 150,
        color: '#DDDDDD',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [7, 8],
            [9, 10],
            [11, 12]
            // Note: This polygon is not closed
          ]
        ]
      }
    }
  ]
}));

describe('BuildingCoordinates', () => {
  describe('fixPolygonCoordinates', () => {
    it('should close polygons that are not closed', () => {
      const coordinates = [
        [
          [1, 2],
          [3, 4],
          [5, 6]
        ]
      ];
      
      const result = fixPolygonCoordinates(coordinates);
      
      expect(result[0][result[0].length - 1]).toEqual(result[0][0]);
    });
    
    it('should not modify already closed polygons', () => {
      const coordinates = [
        [
          [1, 2],
          [3, 4],
          [5, 6],
          [1, 2]
        ]
      ];
      
      const result = fixPolygonCoordinates(coordinates);
      
      expect(result).toEqual(coordinates);
    });
    
    it('should handle invalid input gracefully', () => {
      expect(fixPolygonCoordinates(null)).toEqual([]);
      expect(fixPolygonCoordinates(undefined)).toEqual([]);
      expect(fixPolygonCoordinates([] as any)).toEqual([]);
    });
  });
  
  describe('fixedBuildingFeatures', () => {
    it('should contain fixed polygon coordinates', () => {
      // Check if the second building polygon was fixed (closed)
      const building2 = fixedBuildingFeatures.find(f => f.id === 'building2');
      const coords = building2.geometry.coordinates[0];
      
      // First and last coordinates should be the same
      expect(coords[coords.length - 1]).toEqual(coords[0]);
    });
  });
  
  describe('HighlightBuilding component', () => {
    beforeEach(() => {
      // Reset all mocks
      jest.clearAllMocks();
      
      // Mock context values
      (useCoords as jest.Mock).mockReturnValue({
        setIsInsideBuilding: jest.fn(),
        highlightedBuilding: null,
        setHighlightedBuilding: jest.fn(),
        myLocationCoords: { latitude: 10, longitude: 20 },
      });
      
      (useIndoor as jest.Mock).mockReturnValue({
        inFloorView: false,
      });
      
      // Mock turf functions
      turf.point.mockReturnValue('mocked-point');
      turf.polygon.mockReturnValue('mocked-polygon');
      turf.booleanPointInPolygon.mockReturnValue(false);
    });
    
    it('should render ShapeSource for buildings when not in floor view', () => {
      const { getAllByTestId } = render(<HighlightBuilding />);
      
      expect(getAllByTestId('shape-source')).toHaveLength(1);
      expect(getAllByTestId('fill-extrusion-layer')).toHaveLength(1);
    });
    
    it('should not render when myLocationCoords is null', () => {
      (useCoords as jest.Mock).mockReturnValue({
        setIsInsideBuilding: jest.fn(),
        highlightedBuilding: null,
        setHighlightedBuilding: jest.fn(),
        myLocationCoords: null,
      });
      
      const { queryByTestId } = render(<HighlightBuilding />);
      
      expect(queryByTestId('shape-source')).toBeNull();
    });
    
    it('should not render when in floor view', () => {
      (useIndoor as jest.Mock).mockReturnValue({
        inFloorView: true,
      });
      
      const { queryByTestId } = render(<HighlightBuilding />);
      
      expect(queryByTestId('shape-source')).toBeNull();
    });
    
    it('should check if user is inside any building when location changes', () => {
      const setHighlightedBuilding = jest.fn();
      const setIsInsideBuilding = jest.fn();
      
      (useCoords as jest.Mock).mockReturnValue({
        setIsInsideBuilding,
        highlightedBuilding: null,
        setHighlightedBuilding,
        myLocationCoords: { latitude: 10, longitude: 20 },
      });
      
      render(<HighlightBuilding />);
      
      expect(turf.point).toHaveBeenCalledWith([20, 10]);
      expect(turf.polygon).toHaveBeenCalled();
      expect(turf.booleanPointInPolygon).toHaveBeenCalledWith('mocked-point', 'mocked-polygon');
      expect(setHighlightedBuilding).toHaveBeenCalledWith(undefined);
      expect(setIsInsideBuilding).toHaveBeenCalledWith(false);
    });
    
    it('should highlight a building when user is inside it', () => {
      const setHighlightedBuilding = jest.fn();
      const setIsInsideBuilding = jest.fn();
      const mockBuilding = buildingFeatures[0];
      
      // Mock user being inside a building
      turf.booleanPointInPolygon.mockReturnValue(true);
      
      (useCoords as jest.Mock).mockReturnValue({
        setIsInsideBuilding,
        highlightedBuilding: mockBuilding,
        setHighlightedBuilding,
        myLocationCoords: { latitude: 10, longitude: 20 },
      });
      
      const { getAllByTestId } = render(<HighlightBuilding />);
      
      // Should update context with building info
      expect(setHighlightedBuilding).toHaveBeenCalledWith(mockBuilding);
      expect(setIsInsideBuilding).toHaveBeenCalledWith(true);
      
      // Should render both all buildings and highlighted building
      expect(getAllByTestId('shape-source')).toHaveLength(2);
      expect(getAllByTestId('fill-extrusion-layer')).toHaveLength(2);
    });
    
    it('should handle updates to location coordinates', () => {
      const setHighlightedBuilding = jest.fn();
      const setIsInsideBuilding = jest.fn();
      
      // Initial render with one set of coordinates
      const { rerender } = render(<HighlightBuilding />);
      
      // Then update with new coordinates
      (useCoords as jest.Mock).mockReturnValue({
        setIsInsideBuilding,
        highlightedBuilding: null,
        setHighlightedBuilding,
        myLocationCoords: { latitude: 30, longitude: 40 },
      });
      
      rerender(<HighlightBuilding />);
      
      // Should have called turf functions with new coordinates
      expect(turf.point).toHaveBeenCalledWith([40, 30]);
    });
  });
});