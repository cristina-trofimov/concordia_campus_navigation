import React, { createContext, useState, useContext } from 'react';
import { CoordsContextType } from '../interfaces/CoordsContextType';

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

    return (
        <CoordsContext.Provider value={{
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
        }}>
            {children}
        </CoordsContext.Provider>
    );
};

export const useCoords = () => useContext(CoordsContext);
