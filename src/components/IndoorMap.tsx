import React, { useEffect } from 'react';
import Mapbox from '@rnmapbox/maps';
import { useCoords } from "../data/CoordsContext";
import { useIndoor } from "../data/IndoorContext";
import { buildingFloorAssociations } from '../data/buildingFloorAssociations.ts';
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature.ts';
import { IndoorPointsOfInterest } from './IndoorPointsOfInterest.tsx';
import { RoomInfo } from '../interfaces/RoomInfo.ts';
import { h1Features } from '../data/indoor/Hall/H1.ts';
import { h2Features } from '../data/indoor/Hall/H2.ts';
import { h8Features } from '../data/indoor/Hall/H8.ts';
import { h9Features } from '../data/indoor/Hall/H9.ts';
import { cc1Features } from '../data/indoor/CC/CC1.ts';
import { mb1Features } from '../data/indoor/MB/MB1.ts';
import { mb2Features } from '../data/indoor/MB/MBS2.ts';
import { ve1Features } from '../data/indoor/VE/VE1.ts';
import { ve2Features } from '../data/indoor/VE/VE2.ts';
import { vl1Features } from '../data/indoor/VL/VL1.ts';
import { vl2Features } from '../data/indoor/VL/VL2.ts';

export const featureMap: { [key: string]: any } = {
    h1Features,
    h2Features,
    h8Features,
    h9Features,
    cc1Features,
    mb1Features,
    mb2Features,
    ve1Features,
    ve2Features,
    vl1Features,
    vl2Features,
};

export const floorNameFormat = (floor: string) => {
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
        if (currentFloorAssociations?.[index]) {
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
    const { highlightedBuilding, isInsideBuilding, destinationCoords, myLocationCoords } = useCoords();
    const { setBuildingHasFloors, setInFloorView, inFloorView, setCurrentFloor, setFloorList, currentFloorAssociations, setCurrentFloorAssociations, setIndoorFeatures, indoorFeatures, originRoom, destinationRoom, currentFloor } = useIndoor();
    const { selectIndoorFeatures } = useIndoorFeatures();

    // Check if we should show the room pin
    const shouldShowRoomPin = (room: RoomInfo | null) => {
        if (!room || !room.coordinates || !currentFloor) {
            return false;
        }

        // Check if current floor matches the floor of the selected room
        return currentFloor === floorNameFormat(room.floor);
    };

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

    useEffect(() => {
        if (destinationCoords && isInsideBuilding) {
            setInFloorView(true);
        }
        else {
            setInFloorView(false);
        }
    }, [destinationCoords, myLocationCoords]);

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
                            fillOpacity: [
                                'case',
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

            {/* Origin Room Pin */}
            {shouldShowRoomPin(originRoom) && originRoom?.coordinates && inFloorView && (
                <Mapbox.ShapeSource
                    id="origin-room-pin"
                    shape={{
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: originRoom.coordinates
                        },
                        properties: {
                            roomRef: originRoom.ref,
                            type: 'origin'
                        }
                    }}
                >
                    {/* Origin Circle/Pin */}
                    <Mapbox.CircleLayer
                        id="origin-pin-circle"
                        style={{
                            circleRadius: 8,
                            circleColor: '#4697C9',
                            circleStrokeWidth: 2,
                            circleStrokeColor: '#FFFFFF',
                        }}
                    />
                </Mapbox.ShapeSource>
            )}

            {/* Destination Room Pin */}
            {shouldShowRoomPin(destinationRoom) && destinationRoom?.coordinates && inFloorView && (
                <Mapbox.ShapeSource
                    id="destination-room-pin"
                    shape={{
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: destinationRoom.coordinates
                        },
                        properties: {
                            roomRef: destinationRoom.ref,
                            type: 'destination'
                        }
                    }}
                >
                    {/* Destination Circle/Pin */}
                    <Mapbox.CircleLayer
                        id="destination-pin-circle"
                        style={{
                            circleRadius: 8,
                            circleColor: 'red',
                            circleStrokeWidth: 2,
                            circleStrokeColor: '#FFFFFF',
                        }}
                    />
                </Mapbox.ShapeSource>
            )}

            <IndoorPointsOfInterest />
        </>
    );
};