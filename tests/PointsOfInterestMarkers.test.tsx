import React from 'react';
import { render } from '@testing-library/react-native';
import { PointsOfInterestMarkers } from '../src/components/PointsOfInterestMarkers';
import Mapbox from "@rnmapbox/maps";
import centroid from "@turf/centroid";

// Mock dependencies
jest.mock('@rnmapbox/maps', () => ({
  PointAnnotation: jest.fn(() => null)
}));

jest.mock('@turf/centroid', () => jest.fn(feature => ({
  geometry: {
    coordinates: [feature.coordinates[0], feature.coordinates[1]]
  }
})));

describe('PointsOfInterestMarkers', () => {
  // Mock data
  const mockFeatures = [
    { type: 'Feature', properties: { type: 'restaurant' }, coordinates: [1, 2] },
    { type: 'Feature', properties: { type: 'hotel' }, coordinates: [3, 4] },
    { type: 'Feature', properties: { type: 'restaurant' }, coordinates: [5, 6] }
  ];

  const mockIconComponent = <MockIcon />;

  function MockIcon() {
    return <div>Icon</div>;
  }

  const mockFilter = (feature) => feature.properties.type === 'restaurant';
  const mockIconSize = 24;
  const mockIconColor = 'red';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should filter features correctly', () => {
    // Arrange
    const props = {
      features: mockFeatures,
      filter: mockFilter,
      iconComponent: mockIconComponent,
      iconSize: mockIconSize,
      iconColor: mockIconColor
    };

    // Act
    const { UNSAFE_getAllByType } = render(
      <PointsOfInterestMarkers {...props} />
    );

    // Assert
    // Should return 2 restaurant features, not the hotel
    expect(Mapbox.PointAnnotation).toHaveBeenCalledTimes(2);
  });

  it('should create PointAnnotations with correct coordinates', () => {
    // Arrange
    const props = {
      features: mockFeatures,
      filter: mockFilter,
      iconComponent: mockIconComponent,
      iconSize: mockIconSize,
      iconColor: mockIconColor
    };

    // Act
    render(<PointsOfInterestMarkers {...props} />);

    // Assert
    // First call should be with first restaurant coordinates
    expect(centroid).toHaveBeenCalledWith(mockFeatures[0]);
    expect(Mapbox.PointAnnotation).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: `${mockFilter.name}-marker-0`,
        coordinate: [1, 2]
      }),
      expect.anything()
    );

    // Second call should be with second restaurant coordinates
    expect(centroid).toHaveBeenCalledWith(mockFeatures[2]);
    expect(Mapbox.PointAnnotation).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: `${mockFilter.name}-marker-1`,
        coordinate: [5, 6]
      }),
      expect.anything()
    );
  });

  it('should clone the icon component with correct props', () => {
    // Arrange
    const props = {
      features: mockFeatures.slice(0, 1), // Just use one feature to simplify
      filter: () => true, // Accept all features
      iconComponent: mockIconComponent,
      iconSize: mockIconSize,
      iconColor: mockIconColor
    };

    // Mock React.cloneElement
    const originalCloneElement = React.cloneElement;
    React.cloneElement = jest.fn().mockReturnValue(<MockIcon />);

    // Act
    render(<PointsOfInterestMarkers {...props} />);

    // Assert
    expect(React.cloneElement).toHaveBeenCalledWith(
      mockIconComponent,
      { size: mockIconSize, color: mockIconColor }
    );

    // Cleanup
    React.cloneElement = originalCloneElement;
  });

  it('should not render anything when no features match the filter', () => {
    // Arrange
    const props = {
      features: mockFeatures,
      filter: () => false, // No features match
      iconComponent: mockIconComponent,
      iconSize: mockIconSize,
      iconColor: mockIconColor
    };

    // Act
    render(<PointsOfInterestMarkers {...props} />);

    // Assert
    expect(Mapbox.PointAnnotation).not.toHaveBeenCalled();
  });
});