import React, { createContext, useState, useContext, useMemo } from 'react';
import { IndoorContextType } from '../interfaces/IndoorContextType';
import { BuildingFloorAssociation } from '../interfaces/buildingFloorAssociation';
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature.ts';
import { RoomInfo } from "../interfaces/RoomInfo"

export const IndoorContext = createContext<IndoorContextType>( {
    buildingHasFloors: false,
    setBuildingHasFloors: () => {},
    inFloorView: false,
    setInFloorView: () => {},
    currentFloor: null,
    setCurrentFloor: () => {},
    floorList: [],
    setFloorList: () => {},
    currentFloorAssociations: [],
    setCurrentFloorAssociations: () => {},
    indoorFeatures: [],
    setIndoorFeatures: () => {},
    originRoom: null,
    setOriginRoom: () => {},
    destinationRoom: null,
    setDestinationRoom: () => {},
    indoorTransport: "elevator",
    setIndoorTransport: () => {},
});

export const IndoorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [buildingHasFloors, setBuildingHasFloors] = useState<boolean>(false);
    const [inFloorView, setInFloorView] = useState<boolean>(false);
    const [currentFloor, setCurrentFloor] = useState<string | null>(null);
    const [floorList, setFloorList] = useState<string[]>([]);
    const [currentFloorAssociations, setCurrentFloorAssociations] = useState<BuildingFloorAssociation[]>([]);
    const [indoorFeatures, setIndoorFeatures] = useState<IndoorFeatureCollection[]>([]);
    const [originRoom, setOriginRoom] = useState<RoomInfo | null>(null);
    const [destinationRoom, setDestinationRoom] = useState<RoomInfo | null>(null);
    const [indoorTransport, setIndoorTransport] = useState<string>("elevator");

    const contextValue = useMemo(() => ({
        buildingHasFloors,
        setBuildingHasFloors,
        inFloorView,
        setInFloorView,
        currentFloor,
        setCurrentFloor,
        floorList,
        setFloorList,
        currentFloorAssociations,
        setCurrentFloorAssociations,
        indoorFeatures,
        setIndoorFeatures,
        originRoom,
        setOriginRoom,
        destinationRoom,
        setDestinationRoom,
        indoorTransport,
        setIndoorTransport: (transport: string) => setIndoorTransport(transport),
    }), [
        buildingHasFloors,
        inFloorView,
        currentFloor,
        floorList,
        currentFloorAssociations,
        indoorFeatures,
        originRoom,
        destinationRoom,
        indoorTransport,
    ]);
    
    return (
        <IndoorContext.Provider value={contextValue}>
            {children}
        </IndoorContext.Provider>
    );
};

export const useIndoor = () => useContext(IndoorContext);
