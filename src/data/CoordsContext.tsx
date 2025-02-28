
import React, { createContext, useState, useContext } from 'react';


interface CoordsContextType {
    routeData: any;
    setRouteData: (data: any) => void;
}

export const CoordsContext = createContext<CoordsContextType>({
    routeData: null,
    setRouteData: () => { }
});

export const CoordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [routeData, setRouteData] = useState<any>(null);

    return (
        <CoordsContext.Provider value={{
            routeData,
            setRouteData
        }}>
            {children}
        </CoordsContext.Provider>
    );
};

export const useCoords = () => useContext(CoordsContext);