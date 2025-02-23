// CoordsContext.tsx
import React, { createContext, useState, useContext } from 'react';

interface Coords {
    latitude: number;
    longitude: number;
}

interface CoordsContextType {
    coords: Coords[] | null; // Array of Coords or null
    setCoords: (coords: Coords[] | null) => void;
}

export const CoordsContext = createContext<CoordsContextType>({
    coords: null,
    setCoords: () => { },
});

export const CoordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [coords, setCoords] = useState<Coords[] | null>(null); // State is an array

    return (
        <CoordsContext.Provider value={{ coords, setCoords }}>
            {children}
        </CoordsContext.Provider>
    );
};

export const useCoords = () => useContext(CoordsContext);