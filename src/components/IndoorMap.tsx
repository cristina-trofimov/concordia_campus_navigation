import React, { useEffect } from 'react';
import Mapbox from '@rnmapbox/maps';
import { useCoords } from "../data/CoordsContext";
import { useIndoor } from "../data/IndoorContext";
import { buildingFloorAssociations } from '../data/buildingFloorAssociations.ts';
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature.ts';
import { h1Features } from '../data/indoor/Hall/H1.ts';
import { h2Features } from '../data/indoor/Hall/H2.ts';
import { h8Features } from '../data/indoor/Hall/H8.ts';
import { h9Features } from '../data/indoor/Hall/H9.ts';
import { cc1Features } from '../data/indoor/CC/CC1.ts';
import { mb1Features } from '../data/indoor/MB/MB1.ts';
import { mb2Features } from '../data/indoor/MB/MBS2.ts';
import { IndoorPointsOfInterest } from './IndoorPointsOfInterest.tsx';

const featureMap: { [key: string]: any } = {
    h1Features,
    h2Features,
    h8Features,
    h9Features,
    cc1Features,
    mb1Features,
    mb2Features
};

const floorNameFormat = (floor: string) => {
    let suffix;

    switch (floor) {
        case "1":
            suffix = "st Floor";
            break;
        case "2":
            suffix = "nd Floor";
            break;
        default:
            suffix = floor.includes("S") ? " Floor" : "th Floor";
            break;
    }

    return floor + suffix;
};

export const useIndoorFeatures = () => {
    const { setCurrentFloor, currentFloorAssociations, setIndoorFeatures } = useIndoor();

    const selectIndoorFeatures = (index: number) => {
        if (currentFloorAssociations && currentFloorAssociations[index]) {
            const featureComponent = featureMap[currentFloorAssociations[index].component] as IndoorFeatureCollection[];
            if (featureComponent) {
                setIndoorFeatures(featureComponent);
                setCurrentFloor(floorNameFormat(currentFloorAssociations[index].floor));
            } else {
                setIndoorFeatures([]);
                setCurrentFloor(null);
            }
        } else {
            console.warn("Invalid index or currentFloorAssociations is undefined");
            setIndoorFeatures([]);
            setCurrentFloor(null);
        }
    };

    return { selectIndoorFeatures };
};

export const HighlightIndoorMap = () => {
    const { highlightedBuilding } = useCoords();
    const { setBuildingHasFloors, setInFloorView, inFloorView, setCurrentFloor, setFloorList, currentFloorAssociations, setCurrentFloorAssociations, setIndoorFeatures, indoorFeatures } = useIndoor();
    const { selectIndoorFeatures } = useIndoorFeatures();

    useEffect(() => {
        setInFloorView(false);
        setFloorList([]);
        if (highlightedBuilding) {
            const buildingId = highlightedBuilding.properties.id;
            const associations = buildingFloorAssociations.filter(
                (association) => association.buildingID === buildingId
            );
            setCurrentFloorAssociations(associations);
        }
    }, [highlightedBuilding]);

    useEffect(() => {
        if (currentFloorAssociations.length > 0) {
            setBuildingHasFloors(true);
            setFloorList(currentFloorAssociations.map((association) => floorNameFormat(association.floor)));
            selectIndoorFeatures(0);
        } else {
            setBuildingHasFloors(false);
            setIndoorFeatures([]);
            setCurrentFloor(null);
        }
    }, [currentFloorAssociations]);

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
                                ['==', ['get', 'indoor'], 'corridor'], 0.2,
                                0.5,
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

            <IndoorPointsOfInterest />
        </>
    );
};