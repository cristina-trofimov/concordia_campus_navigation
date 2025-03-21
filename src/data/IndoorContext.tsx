import React, { createContext, useState, useContext } from 'react';
import { BuildingFloorAssociation } from '../interfaces/buildingFloorAssociation';
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature.ts';
import { IndoorContextType } from '../interfaces/IndoorContextType.ts';

export const IndoorContext = createContext<IndoorContextType>({
    buildingHasFloors: false,
    setBuildingHasFloors: () => { },
    inFloorView: false,
    setInFloorView: () => { },
    currentFloor: null,
    setCurrentFloor: () => { },
    floorList: [],
    setFloorList: () => { },
    currentFloorAssociations: [],
    setCurrentFloorAssociations: () => { },
    indoorFeatures: [],
    setIndoorFeatures: () => { },
});

export const IndoorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [buildingHasFloors, setBuildingHasFloors] = useState<boolean>(false);
    const [inFloorView, setInFloorView] = useState<boolean>(false);
    const [currentFloor, setCurrentFloor] = useState<string | null>(null);
    const [floorList, setFloorList] = useState<string[]>([]);
    const [currentFloorAssociations, setCurrentFloorAssociations] = useState<BuildingFloorAssociation[]>([]);
    const [indoorFeatures, setIndoorFeatures] = useState<IndoorFeatureCollection[]>([]);

    return (
        <IndoorContext.Provider value={{
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
        }}>
            {children}
        </IndoorContext.Provider>
    );
};

export const useIndoor = () => useContext(IndoorContext);