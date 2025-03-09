// // Mock Mapbox components
jest.mock('@rnmapbox/maps', () => ({
  MapView: jest.fn(({ children }) => children),
  ShapeSource: jest.fn(({ children }) => children),
  FillExtrusionLayer: jest.fn(() => null),
  Camera: jest.fn(() => null),
  UserLocation: jest.fn(() => null),
  setAccessToken: jest.fn(),
}));

import React from 'react';
import Mapbox from '@rnmapbox/maps';
import { ShapeSource, FillExtrusionLayer } from '@rnmapbox/maps';
import { render } from '@testing-library/react-native';
import { HighlightBuilding } from '../src/components/BuildingCoordinates';




describe('HighlightBuilding', () => {
  it('renders ShapeSource and FillExtrusionLayer with correct props', () => {
    const { getByTestId } = render(<HighlightBuilding />);

    // Ensure that ShapeSource and FillExtrusionLayer are renderedw
    expect(Mapbox.ShapeSource).toHaveBeenCalled();
    expect(Mapbox.FillExtrusionLayer).toHaveBeenCalled();

    // Check for some properties (ensure they are passed correctly)
    expect(Mapbox.ShapeSource).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'buildings1',
        shape: expect.objectContaining({
          type: 'FeatureCollection',
        }),
      }),
      expect.anything()  // The children of ShapeSource (the FillExtrusionLayer)
    );

    expect(Mapbox.FillExtrusionLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'custom-buildings',
        style: expect.objectContaining({
          fillExtrusionColor: ['get', 'color'],
          fillExtrusionHeight: ['get', 'height'],
        }),
      }),
      expect.anything()
    );
  });
});
