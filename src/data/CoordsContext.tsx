import React, { createContext, useState, useContext, useMemo } from 'react';
import { CoordsContextType } from '../interfaces/CoordsContextType';
import { BuildingFloorAssociation } from '../interfaces/buildingFloorAssociation';
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature.ts';

export const CoordsContext = createContext<CoordsContextType>({
    routeData: null,
    setRouteData: () => { },
    isInsideBuilding: false,
    setIsInsideBuilding: () => { },
    myLocationString: "",
    setmyLocationString: () => { },
    isTransit: false,
    setIsTransit: () => { },
    buildingHasFloors: false,
    setBuildingHasFloors: () => { },
    highlightedBuilding: null,
    setHighlightedBuilding: () => { },
    myLocationCoords: null,
    setMyLocationCoords: () => { },
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

export const CoordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routeData, setRouteData] = useState<any>(null);
    const [isInsideBuilding, setIsInsideBuilding] = useState<boolean>(false);
    const [myLocationString, setmyLocationString] = useState<string>("");
    const [isTransit, setIsTransit] = useState<boolean>(false);
    const [buildingHasFloors, setBuildingHasFloors] = useState<boolean>(false);
    const [highlightedBuilding, setHighlightedBuilding] = useState<any>(null);
    const [myLocationCoords, setMyLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [inFloorView, setInFloorView] = useState<boolean>(false);
    const [currentFloor, setCurrentFloor] = useState<string | null>(null);
    const [floorList, setFloorList] = useState<string[]>([]);
    const [currentFloorAssociations, setCurrentFloorAssociations] = useState<BuildingFloorAssociation[]>([]);
    const [indoorFeatures, setIndoorFeatures] = useState<IndoorFeatureCollection[]>([]);

    const contextValue = useMemo(() => ({
        routeData,
        setRouteData,
        isInsideBuilding,
        setIsInsideBuilding,
        myLocationString,
        setmyLocationString,
        isTransit,
        setIsTransit,
        buildingHasFloors,
        setBuildingHasFloors,
        highlightedBuilding,
        setHighlightedBuilding,
        myLocationCoords,
        setMyLocationCoords,
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
      }), [routeData, isInsideBuilding, myLocationString, isTransit]);
    
      return (
        <CoordsContext.Provider value={contextValue}>
          {children}
        </CoordsContext.Provider>
    );
};

export const useCoords = () => useContext(CoordsContext);
