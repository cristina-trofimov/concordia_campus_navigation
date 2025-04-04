import React, { createContext, useState, useContext, useMemo } from 'react';
import { IndoorContextType } from '../interfaces/IndoorContextType';
import { BuildingFloorAssociation } from '../interfaces/buildingFloorAssociation';
import { IndoorFeatureCollection } from '../interfaces/IndoorFeature.ts';
import { RoomInfo } from "../interfaces/RoomInfo"
import { Feature, LineString } from 'geojson';

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
  originRoom: null,
  setOriginRoom: () => { },
  destinationRoom: null,
  setDestinationRoom: () => { },
  pathFeatures: [],
  setPathFeatures: () => { },
  isRoutingActive: false,
  setIsRoutingActive: () => { },
  clearRoute: function (): void {
    throw new Error('Function not implemented.');
  }
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
    const [pathFeatures, setPathFeatures] = useState<Feature<LineString>[]>([]);
    const [isRoutingActive, setIsRoutingActive] = useState(false);

    const clearRoute = () => {
      setOriginRoom(null);
      setDestinationRoom(null);
      setPathFeatures([]);
      setIsRoutingActive(false);
    };

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
        pathFeatures,
        setPathFeatures,
        isRoutingActive,
        setIsRoutingActive,
        clearRoute
      }), [buildingHasFloors, inFloorView, currentFloor, floorList, currentFloorAssociations, indoorFeatures, originRoom, destinationRoom, pathFeatures, isRoutingActive]);
    
      return (
        <IndoorContext.Provider value={contextValue}>
          {children}
        </IndoorContext.Provider>
    );
};

export const useIndoor = () => useContext(IndoorContext);
