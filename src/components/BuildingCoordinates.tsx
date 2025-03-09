import React, { useEffect, useMemo } from 'react';
import Mapbox from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import { buildingFeatures } from '../data/buildingFeatures.ts'
import { hallFeatures } from '../data/indoor/hallFeatures.ts'
import { useCoords } from "../data/CoordsContext";

interface HighlightBuildingProps {
  userCoordinates: [number, number] | null;
}

const allIndoorFeatures = [...hallFeatures];

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

const fixFeatureCoordinates = (feature: any) => {
  if (feature.geometry.type === 'Polygon') {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: fixPolygonCoordinates(feature.geometry.coordinates),
      },
    };
  }
  return feature; 
};

const fixedBuildingFeatures = buildingFeatures.map(fixFeatureCoordinates);
const fixedIndoorFeatures = allIndoorFeatures.map(fixFeatureCoordinates);
const fixedAllFeatures = [...fixedBuildingFeatures, ...fixedIndoorFeatures];

export const HighlightBuilding = ({ userCoordinates }: HighlightBuildingProps) => {
  const { setIsInsideBuilding } = useCoords();

  const swappedUserCoordinates = useMemo(() => {
    if (!userCoordinates) return null;
    const [latitude, longitude] = userCoordinates;
    return [longitude, latitude];
  }, [userCoordinates]);

  const highlightedFeature = useMemo(() => {
    if (!swappedUserCoordinates) return null;
    return fixedAllFeatures.find((feature) => {
      if (feature.geometry.type === 'Polygon') {
        return turf.booleanPointInPolygon(
          turf.point(swappedUserCoordinates),
          turf.polygon(feature.geometry.coordinates)
        );
      }
      return false; // Skip non-Polygon features
    });
  }, [swappedUserCoordinates]);

  // Update the context state whenever user location changes
  useEffect(() => {
    setIsInsideBuilding(!!highlightedFeature);
  }, [highlightedFeature, setIsInsideBuilding]);

  if (!userCoordinates) {
    return null;
  }

  return (
    <>

      <Mapbox.ShapeSource
        id="buildings1"
        shape={{
          type: 'FeatureCollection',
          features: fixedAllFeatures,
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


      {/* Highlight the feature the user is inside */}
      {highlightedFeature && (
        <Mapbox.ShapeSource
          id="highlighted-feature"
          shape={{
            type: 'FeatureCollection',
            features: [highlightedFeature],
          }}
        >
          <Mapbox.FillExtrusionLayer
            id="highlighted-feature-layer"
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