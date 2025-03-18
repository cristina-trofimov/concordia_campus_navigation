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
});

export const CoordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routeData, setRouteData] = useState<any>(null);
    const [isInsideBuilding, setIsInsideBuilding] = useState<boolean>(false);
    const [myLocationString, setmyLocationString] = useState<string>("");
    const [isTransit, setIsTransit] = useState<boolean>(false);


    return (
        <CoordsContext.Provider value={{
            routeData,
            setRouteData,
            isInsideBuilding,
            setIsInsideBuilding,
            myLocationString,
            setmyLocationString,
            isTransit,
            setIsTransit
        }}>
            {children}
        </CoordsContext.Provider>
    );
};

export const useCoords = () => useContext(CoordsContext);
