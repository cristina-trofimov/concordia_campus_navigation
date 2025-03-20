import React, { useEffect, useMemo } from 'react';
import Mapbox from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import { buildingFeatures } from '../data/buildingFeatures.ts'
import { useCoords } from "../data/CoordsContext";

export const fixPolygonCoordinates = (coordinates: number[][][]): number[][][] => {
    if (!coordinates || !Array.isArray(coordinates)) {
        console.warn("Invalid coordinates input:", coordinates);
        return [];
    }

    return coordinates.map((ring) => {
        if (!ring || !Array.isArray(ring) || ring.length === 0) {
            console.warn("Invalid ring in coordinates:", ring);
            return [];
        }

        const firstCoord = ring[0];
        const lastCoord = ring[ring.length - 1];

        if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
            return [...ring, firstCoord];
        }

        return ring;
    });
};

export const fixedBuildingFeatures = buildingFeatures.map((feature) => {
  return {
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: fixPolygonCoordinates(feature.geometry.coordinates),
    },
  };
});

export const HighlightBuilding = () => {
  const { setIsInsideBuilding, highlightedBuilding, setHighlightedBuilding, myLocationCoords } = useCoords();

  const swappedUserCoordinates = useMemo(() => {
    if (!myLocationCoords) return null;
    const { latitude, longitude } = myLocationCoords;
    return [longitude, latitude];
  }, [myLocationCoords]);

  // Update the context state whenever user location changes
  useEffect(() => {
          if (swappedUserCoordinates) {
              const building = buildingFeatures.find((feature) => {
                  if (!feature.geometry || !feature.geometry.coordinates) {
                      console.warn("Invalid feature geometry:", feature);
                      return false;
                  }

                  const fixedCoordinates = fixPolygonCoordinates(feature.geometry.coordinates);
                  return turf.booleanPointInPolygon(
                      turf.point(swappedUserCoordinates),
                      turf.polygon(fixedCoordinates)
                  );
              });

              setHighlightedBuilding(building);
              setIsInsideBuilding(!!building);
          }
      }, [swappedUserCoordinates, setHighlightedBuilding, setIsInsideBuilding]);

  if (!myLocationCoords) {
    return null;
  }

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
              fillExtrusionOpacity: 0.3,
            }}
          />
        </Mapbox.ShapeSource>
      )}
    </>
  );
};