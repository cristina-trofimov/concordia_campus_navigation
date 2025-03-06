import React, { createContext, useState, useContext } from 'react';
import { CoordsContextType } from '../interfaces/CoordsContextType';

export const CoordsContext = createContext<CoordsContextType>({
    routeData: null,
    setRouteData: () => {},
    isInsideBuilding: false,
    setIsInsideBuilding: () => {}
});

export const CoordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routeData, setRouteData] = useState<any>(null);
    const [isInsideBuilding, setIsInsideBuilding] = useState<boolean>(false);

    return (
        <CoordsContext.Provider value={{
            routeData,
            setRouteData,
            isInsideBuilding,
            setIsInsideBuilding
        }}>
            {children}
        </CoordsContext.Provider>
    );
};

export const useCoords = () => useContext(CoordsContext);
