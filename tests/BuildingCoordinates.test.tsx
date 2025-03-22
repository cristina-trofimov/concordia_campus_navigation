/**
 * @jest-environment jsdom
 */

// Import jest-dom matchers
import '@testing-library/jest-dom';

// Mock @rnmapbox/maps first
jest.mock('@rnmapbox/maps', () => {
  return {
    ShapeSource: jest.fn(({ id, children, ...props }) => (
      <div data-testid={`shape-source-${id}`} {...props}>
        {children}
      </div>
    )),
    FillExtrusionLayer: jest.fn(({ id, ...props }) => (
      <div data-testid={`fill-extrusion-layer-${id}`} {...props} />
    ))
  };
});

// Other imports
import { HighlightBuilding } from '../src/components/BuildingCoordinates.tsx';
import * as turf from '@turf/turf';
import React from 'react';
import { render } from '@testing-library/react';
import { buildingFeatures } from '../src/data/buildingFeatures.ts';

// Your existing mocks
jest.mock('@turf/turf', () => {
  const originalModule = jest.requireActual('@turf/turf');
  return {
    ...originalModule,
    booleanPointInPolygon: jest.fn().mockReturnValue(false),
    point: jest.fn().mockImplementation((coords) => ({ type: 'Point', coordinates: coords }))
  };
});

jest.mock('../src/data/CoordsContext.tsx', () => ({
  useCoords: jest.fn()
}));

const { useCoords } = require('../src/data/CoordsContext.tsx');
const mockedTurf = turf as jest.Mocked<typeof turf>;

// Rest of your test file remains the same

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
    const { container } = render(<HighlightBuilding userCoordinates={null} />);
    // When userCoordinates is null, the component returns null
    expect(container.firstChild).toBeNull();
    // setIsInsideBuilding is still called with false when highlightedBuilding is null
    expect(setIsInsideBuildingMock).toHaveBeenCalledWith(false);
  });

  it('renders with user coordinates outside any building', () => {
    const outsideCoords: [number, number] = [40.7128, -74.0060]; // New York coordinates
    
    const { queryByTestId } = render(<HighlightBuilding userCoordinates={outsideCoords} />);
    
    expect(queryByTestId('shape-source-buildings1')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-all-buildings')).toBeInTheDocument();
    expect(queryByTestId('shape-source-highlighted-building')).not.toBeInTheDocument();
    expect(setIsInsideBuildingMock).toHaveBeenCalledWith(false);
  });

  it('renders with user coordinates inside a building', () => {
    // Override the default mock to return true for this test
    mockedTurf.booleanPointInPolygon.mockReturnValue(true);
    
    const insideCoords: [number, number] = buildingFeatures[0].geometry.coordinates[0][0].slice().reverse();
    const { queryByTestId } = render(<HighlightBuilding userCoordinates={insideCoords} />);

    expect(queryByTestId('shape-source-buildings1')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-all-buildings')).toBeInTheDocument();
    expect(queryByTestId('shape-source-highlighted-building')).toBeInTheDocument();
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