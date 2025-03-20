import React, { useEffect, useMemo, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { fixPolygonCoordinates, fixedBuildingFeatures, HighlightBuilding } from './BuildingCoordinates.tsx';
import { buildingFeatures } from '../data/buildingFeatures.ts'
import { useCoords } from "../data/CoordsContext";
import { buildingFloorAssociations } from '../data/buildingFloorAssociations.ts';
import { h1Features } from '../data/indoor/Hall/H1.ts';
import { h2Features } from '../data/indoor/Hall/H2.ts';
import { h8Features } from '../data/indoor/Hall/H8.ts';
import { h9Features } from '../data/indoor/Hall/H9.ts';
import { cc1Features } from '../data/indoor/CC/CC1.ts';

const featureMap: { [key: string]: any } = {
    h1Features,
    h2Features,
    h8Features,
    h9Features,
    cc1Features,
};

export const HighlightIndoorMap = () => {
    const { setBuildingHasFloors, highlightedBuilding } = useCoords();
    const [indoorFeatures, setIndoorFeatures] = useState([]);

    // Check if the building has indoor maps
    useEffect(() => {
        if (highlightedBuilding) {
            const buildingId = highlightedBuilding.properties.id;
            const floorAssociations = buildingFloorAssociations.filter(
                (association) => association.buildingID === buildingId
            );

            if (floorAssociations.length > 0) {
                setBuildingHasFloors(true);

                // Get the first floor's feature component from the map
                const featureComponent = featureMap[floorAssociations[2].component];
                if (featureComponent) {
                    setIndoorFeatures(featureComponent);
                } else {
                    setIndoorFeatures([]);
                }
            } else {
                setBuildingHasFloors(false);
                setIndoorFeatures([]);
            }
        }
    }, [highlightedBuilding]);

    return (
        <>
            {indoorFeatures.length > 0 && (
                <Mapbox.ShapeSource
                    id="indoor-features"
                    shape={{
                        type: 'FeatureCollection',
                        features: indoorFeatures,
                    }}
                >
                    <Mapbox.FillLayer
                        id="indoor-polygons"
                        style={{
                            fillColor: '#912338',
                            fillOutlineColor: 'black',
                            fillOpacity: ['case',
                                ['==', ['get', 'indoor'], 'corridor'], 0.1,
                                0.4,
                            ],
                        }}
                    />
                    <Mapbox.SymbolLayer
                        id="room-numbers"
                        style={{
                            textField: ['get', 'ref'],
                            textSize: [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                10, 0,
                                12, 0,
                                15, 0,
                                20, 20
                            ],
                            textColor: '#FFFFFF',
                            textAnchor: 'center',
                            textJustify: 'center',
                            textAllowOverlap: true,
                        }}
                    />
                </Mapbox.ShapeSource>
            )}
        </>
    );
};