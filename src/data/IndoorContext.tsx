import React, { createContext, useState, useContext, useMemo } from 'react';
import { IndoorContextType } from '../interfaces/IndoorContextType';
import { BuildingFloorAssociation } from '../interfaces/buildingFloorAssociation';
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature.ts';

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

export const IndoorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [buildingHasFloors, setBuildingHasFloors] = useState<boolean>(false);
    const [inFloorView, setInFloorView] = useState<boolean>(false);
    const [currentFloor, setCurrentFloor] = useState<string | null>(null);
    const [floorList, setFloorList] = useState<string[]>([]);
    const [currentFloorAssociations, setCurrentFloorAssociations] = useState<BuildingFloorAssociation[]>([]);
    const [indoorFeatures, setIndoorFeatures] = useState<IndoorFeatureCollection[]>([]);

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
      }), [buildingHasFloors, inFloorView, currentFloor, floorList, currentFloorAssociations, indoorFeatures]);
    
      return (
        <IndoorContext.Provider value={contextValue}>
          {children}
        </IndoorContext.Provider>
    );
};

export const useIndoor = () => useContext(IndoorContext);
