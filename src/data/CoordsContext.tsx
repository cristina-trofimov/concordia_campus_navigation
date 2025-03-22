import React, { createContext, useState, useContext, useMemo } from 'react';
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
    highlightedBuilding: null,
    setHighlightedBuilding: () => { },
    myLocationCoords: null,
    setMyLocationCoords: () => { },
});

export const CoordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routeData, setRouteData] = useState<any>(null);
    const [isInsideBuilding, setIsInsideBuilding] = useState<boolean>(false);
    const [myLocationString, setmyLocationString] = useState<string>("");
    const [isTransit, setIsTransit] = useState<boolean>(false);
    const [highlightedBuilding, setHighlightedBuilding] = useState<any>(null);
    const [myLocationCoords, setMyLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);

    const contextValue = useMemo(() => ({
        routeData,
        setRouteData,
        isInsideBuilding,
        setIsInsideBuilding,
        myLocationString,
        setmyLocationString,
        isTransit,
        setIsTransit,
        highlightedBuilding,
        setHighlightedBuilding,
        myLocationCoords,
        setMyLocationCoords,
      }), [routeData, isInsideBuilding, myLocationString, isTransit, highlightedBuilding, myLocationCoords]);
    
      return (
        <CoordsContext.Provider value={contextValue}>
          {children}
        </CoordsContext.Provider>
    );
};

export const useCoords = () => useContext(CoordsContext);
