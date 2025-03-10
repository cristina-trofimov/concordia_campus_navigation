import { HighlightBuilding } from '../src/data/highlightBuildingData.ts'; // Replace with the correct file path
import { useCoords } from '../src/interfaces/CoordsContextType.ts'; // Replace with the correct file path
import { buildingFeatures } from '../src/data/buildingFeatures.ts'; // Replace with the correct file path
import * as turf from '@turf/turf';
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('../src/data/CoordsContext.tsx', () => ({
  useCoords: jest.fn(),
}));

jest.mock('@rnmapbox/maps', () => ({
  ShapeSource: ({ children }) => <div data-testid="shape-source">{children}</div>,
  FillExtrusionLayer: ({ id }) => <div data-testid={`fill-extrusion-layer-${id}`} />,
}));

describe('HighlightBuilding', () => {
  const setIsInsideBuildingMock = jest.fn();

  beforeEach(() => {
    (useCoords as jest.Mock).mockReturnValue({
      setIsInsideBuilding: setIsInsideBuildingMock,
    });
    setIsInsideBuildingMock.mockClear();
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
    // Assuming buildingFeatures has a polygon that contains coordinates close to [0,0]
    const insideCoords: [number, number] = buildingFeatures[0].geometry.coordinates[0][0].slice().reverse()
    const { queryByTestId } = render(<HighlightBuilding userCoordinates={insideCoords} />);

    expect(queryByTestId('shape-source')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-all-buildings')).toBeInTheDocument();
    expect(queryByTestId('fill-extrusion-layer-highlighted-building-layer')).toBeInTheDocument();
    expect(setIsInsideBuildingMock).toHaveBeenCalledWith(true);
  });

  it('updates setIsInsideBuilding when userCoordinates change', () => {
    const { rerender } = render(<HighlightBuilding userCoordinates={[40.7128, -74.0060]} />);
    rerender(<HighlightBuilding userCoordinates={buildingFeatures[0].geometry.coordinates[0][0].slice().reverse()} />);

    expect(setIsInsideBuildingMock).toHaveBeenLastCalledWith(true);
  });

  it('correctly swaps user coordinates for turf', () => {
      const userCoordinates: [number, number] = [40.7128, -74.0060];
      const swappedCoordinates: [number, number] = [-74.0060, 40.7128];
      const point = turf.point(swappedCoordinates);
      const polygon = turf.polygon([[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]);

      const booleanPointInPolygonSpy = jest.spyOn(turf, 'booleanPointInPolygon');
      render(<HighlightBuilding userCoordinates={userCoordinates} />);

      expect(booleanPointInPolygonSpy).toHaveBeenCalled();
      booleanPointInPolygonSpy.mockRestore();
  });
})






// import { HighlightBuilding } from '../src/data/highlightBuildingData.ts'; // Replace with the correct file path
// import { useCoords } from '../src/interfaces/CoordsContextType.ts'; // Replace with the correct file path
// import { buildingFeatures } from '../src/data/buildingFeatures.ts'; // Replace with the correct file path
// import * as turf from '@turf/turf';
// import React from 'react';
// import { render } from '@testing-library/react';

// // Mocking Mapbox components since they are native and we can't fully render them.
// jest.mock('@rnmapbox/maps', () => ({
//   ShapeSource: ({ children }) => <div data-testid="shape-source">{children}</div>,
//   FillExtrusionLayer: ({ id }) => <div data-testid={`fill-extrusion-layer-${id}`} />,
// }));

// // Mocking the useCoords hook
// jest.mock('../src/data/CoordsContext.tsx', () => ({
//   useCoords: jest.fn(),
// }));

// describe('HighlightBuilding', () => {
//   const setIsInsideBuildingMock = jest.fn();

//   beforeEach(() => {
//     (useCoords as jest.Mock).mockReturnValue({
//       setIsInsideBuilding: setIsInsideBuildingMock,
//     });
//     setIsInsideBuildingMock.mockClear();
//   });

  

// });