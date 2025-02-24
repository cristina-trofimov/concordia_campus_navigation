import React, { useMemo } from 'react';
import Mapbox from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import { buildingFeatures } from '../data/buildingFeatures.ts'

interface HighlightBuildingProps {
  userCoordinates: [number, number] | null;
}

const fixPolygonCoordinates = (coordinates: number[][][]): number[][][] => {
  return coordinates.map((ring) => {
    const firstCoord = ring[0];
    const lastCoord = ring[ring.length - 1];

    if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
      return [...ring, firstCoord];
    }

    return ring;
  });
};

const fixedBuildingFeatures = buildingFeatures.map((feature) => {
  return {
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: fixPolygonCoordinates(feature.geometry.coordinates),
    },
  };
});

export const HighlightBuilding = ({ userCoordinates }: HighlightBuildingProps) => {
  if (!userCoordinates) {
    return null;
  }

  const [latitude, longitude] = userCoordinates;
  const swappedUserCoordinates = [longitude, latitude];


  const highlightedBuilding = useMemo(() => {
    return fixedBuildingFeatures.find((feature) => {
      return turf.booleanPointInPolygon(
        turf.point(swappedUserCoordinates),
        turf.polygon(feature.geometry.coordinates)
      );
    });
  }, [swappedUserCoordinates]);

  return (
    <>

      <Mapbox.ShapeSource
        id="buildings1"
        shape={{
          type: 'FeatureCollection',
          features: fixedBuildingFeatures,
        }}
      >
        <Mapbox.FillExtrusionLayer
          id="all-buildings"
          minZoomLevel={0}
          maxZoomLevel={22}
          style={{
            fillExtrusionColor: ['get', 'color'],
            fillExtrusionHeight: ['get', 'height'],
            fillExtrusionOpacity: 0.3, 
          }}
        />
      </Mapbox.ShapeSource>


      {highlightedBuilding && (
        <Mapbox.ShapeSource
          id="highlighted-building"
          shape={{
            type: 'FeatureCollection',
            features: [highlightedBuilding],
          }}
        >
          <Mapbox.FillExtrusionLayer
            id="highlighted-building-layer"
            minZoomLevel={0}
            maxZoomLevel={22}
            style={{
              fillExtrusionColor: '#F37413',
              fillExtrusionHeight: ['get', 'height'],
              fillExtrusionOpacity: 0.45,
            }}
          />
        </Mapbox.ShapeSource>
      )}
    </>
  );
};