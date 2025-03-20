import React, { useEffect, useState } from 'react';
import Mapbox from '@rnmapbox/maps';
import { useCoords } from "../data/CoordsContext";
import { buildingFloorAssociations } from '../data/buildingFloorAssociations.ts';
import { BuildingFloorAssociation } from '../interfaces/buildingFloorAssociation.ts';
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
    const { setBuildingHasFloors, highlightedBuilding, setInFloorView, inFloorView, setCurrentFloor } = useCoords();
    const [indoorFeatures, setIndoorFeatures] = useState([]);
    const [floorAssociations, setFloorAssociations] = useState<BuildingFloorAssociation[]>([]);

    const selectIndoorFeatures = (index: number) => {
        const featureComponent = featureMap[floorAssociations[index].component];
        if (featureComponent) {
            setIndoorFeatures(featureComponent);
            setCurrentFloor(floorAssociations[index].floor);
        } else {
            setIndoorFeatures([]);
            setCurrentFloor(null);
        }
    }

    useEffect(() => {
        if (highlightedBuilding) {
            setInFloorView(false);
            const buildingId = highlightedBuilding.properties.id;
            const associations = buildingFloorAssociations.filter(
                (association) => association.buildingID === buildingId
            );
            setFloorAssociations(associations);
        }
    }, [highlightedBuilding]);
    
    useEffect(() => {
        if (floorAssociations.length > 0) {
            setBuildingHasFloors(true);
            selectIndoorFeatures(0);
        } else {
            setBuildingHasFloors(false);
            setIndoorFeatures([]);
            setCurrentFloor(null);
        }
    }, [floorAssociations]);

    return (
        <>
            {indoorFeatures.length > 0 && inFloorView && (
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