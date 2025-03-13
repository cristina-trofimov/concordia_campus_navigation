/**
 * @jest-environment jsdom
 */

// Explicitly import from the correct path
// You may need to adjust this path to match your project structure
import { HighlightBuilding } from '../src/components/highlighBuildingData.ts';
import * as turf from '@turf/turf';
import React from 'react';
import { render } from '@testing-library/react';
import { buildingFeatures } from '../src/data/buildingFeatures.ts';

// Mock modules before using them
jest.mock('@turf/turf', () => {
  const originalModule = jest.requireActual('@turf/turf');
  return {
    ...originalModule,
    booleanPointInPolygon: jest.fn().mockReturnValue(false),
    point: jest.fn().mockImplementation((coords) => ({ type: 'Point', coordinates: coords }))
  };
});

// Mock the CoordsContext
jest.mock('../src/data/CoordsContext.tsx', () => ({
  useCoords: jest.fn()
}));

// Import the mocked module after mocking
const { useCoords } = require('../src/data/CoordsContext.tsx');
const mockedTurf = turf as jest.Mocked<typeof turf>;

describe('HighlightBuilding', () => {
  const setIsInsideBuildingMock = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Configure the useCoords mock
    (useCoords as jest.Mock).mockReturnValue({
      setIsInsideBuilding: setIsInsideBuildingMock
    });
    
    // Reset the turf booleanPointInPolygon mock for specific tests
    mockedTurf.booleanPointInPolygon.mockReturnValue(false);
  });

  it('renders without user coordinates', () => {
    const { queryByTestId } = render(<HighlightBuilding userCoordinates={null} />);
    expect(queryByTestId('shape-source')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-all-buildings')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-highlighted-building-layer')).not.toBeInTheDocument();
    expect(setIsInsideBuildingMock).not.toHaveBeenCalled();
  });

  it('renders with user coordinates outside any building', () => {
    const outsideCoords: [number, number] = [40.7128, -74.0060]; // New York coordinates
    
    const { queryByTestId } = render(<HighlightBuilding userCoordinates={outsideCoords} />);
    
    expect(queryByTestId('shape-source')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-all-buildings')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-highlighted-building-layer')).not.toBeInTheDocument();
    expect(setIsInsideBuildingMock).toHaveBeenCalledWith(false);
  });

  it('renders with user coordinates inside a building', () => {
    // Override the default mock to return true for this test
    mockedTurf.booleanPointInPolygon.mockReturnValue(true);
    
    const insideCoords: [number, number] = buildingFeatures[0].geometry.coordinates[0][0].slice().reverse();
    const { queryByTestId } = render(<HighlightBuilding userCoordinates={insideCoords} />);

    expect(queryByTestId('shape-source')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-all-buildings')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-highlighted-building-layer')).toBeInTheDocument();
    expect(setIsInsideBuildingMock).toHaveBeenCalledWith(true);
  });

  it('updates setIsInsideBuilding when userCoordinates change', () => {
    // First render with coordinates outside
    const { rerender } = render(<HighlightBuilding userCoordinates={[40.7128, -74.0060]} />);
    
    // Change mock for second render to simulate being inside a building
    mockedTurf.booleanPointInPolygon.mockReturnValue(true);
    
    // Rerender with different coordinates
    rerender(<HighlightBuilding userCoordinates={buildingFeatures[0].geometry.coordinates[0][0].slice().reverse()} />);

    expect(setIsInsideBuildingMock).toHaveBeenLastCalledWith(true);
  });

  it('correctly swaps user coordinates for turf', () => {
    const userCoordinates: [number, number] = [40.7128, -74.0060];
    
    render(<HighlightBuilding userCoordinates={userCoordinates} />);

    // Check if point was called with swapped coordinates
    expect(mockedTurf.point).toHaveBeenCalledWith([-74.0060, 40.7128]);
    expect(mockedTurf.booleanPointInPolygon).toHaveBeenCalled();
  });
});