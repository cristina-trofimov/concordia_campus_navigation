import React, { useEffect, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { Feature, LineString } from 'geojson';
import { useIndoor } from "../data/IndoorContext";
import { findPathBetweenRooms, getPathFeaturesForFloor } from './IndoorRouting';

export const IndoorPath: React.FC = () => {
  const { originRoom, destinationRoom, currentFloor, inFloorView } = useIndoor();
  const [pathFeatures, setPathFeatures] = useState<Feature<LineString>[]>([]);
  const [currentFloorPath, setCurrentFloorPath] = useState<Feature<LineString>[]>([]);
  
  // Calculate path when origin or destination changes
  useEffect(() => {
    if (originRoom && destinationRoom) {
      const path = findPathBetweenRooms(originRoom, destinationRoom);
      setPathFeatures(path);
    } else {
      setPathFeatures([]);
    }
  }, [originRoom, destinationRoom]);
  
  // Filter path features for current floor
  useEffect(() => {
    if (currentFloor && pathFeatures.length > 0) {
      const floorPath = getPathFeaturesForFloor(pathFeatures, currentFloor);
      setCurrentFloorPath(floorPath);
    } else {
      setCurrentFloorPath([]);
    }
  }, [currentFloor, pathFeatures]);
  
  if (!inFloorView || currentFloorPath.length === 0) {
    return null;
  }
  
  return (
    <Mapbox.ShapeSource
      id="indoor-path"
      shape={{
        type: 'FeatureCollection',
        features: currentFloorPath
      }}
    >
      <Mapbox.LineLayer
        id="indoor-path-line"
        style={{
          lineWidth: 4,
          lineColor: '#0077cc',
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
      
      {/* Arrows to indicate direction */}
      <Mapbox.SymbolLayer
        id="indoor-path-direction"
        style={{
          symbolPlacement: 'line',
          symbolSpacing: 40,
          iconImage: 'arrow', // You'll need to add this icon to your assets
          iconSize: 0.6,
          iconAllowOverlap: true,
          iconIgnorePlacement: true
        }}
      />
    </Mapbox.ShapeSource>
  );
};