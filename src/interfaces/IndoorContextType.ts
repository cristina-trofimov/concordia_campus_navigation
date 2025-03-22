import { BuildingFloorAssociation } from "./buildingFloorAssociation";

export interface IndoorContextType {
    buildingHasFloors: boolean;
    setBuildingHasFloors: (hasFloors: boolean) => void;
    inFloorView: boolean;
    setInFloorView: (inFloorView: boolean) => void;
    currentFloor: string | null;
    setCurrentFloor: (floor: string | null) => void;
    floorList: string[];
    setFloorList: (floors: string[]) => void;
    currentFloorAssociations: BuildingFloorAssociation[];
    setCurrentFloorAssociations: (associations: BuildingFloorAssociation[]) => void;
    indoorFeatures: any[];
    setIndoorFeatures: (features: any[]) => void;
}