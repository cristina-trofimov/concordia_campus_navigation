import { BuildingFloorAssociation } from "./buildingFloorAssociation";
import { RoomInfo } from "../interfaces/RoomInfo"

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
    originRoom: RoomInfo | null;
    setOriginRoom: (room: RoomInfo | null) => void;
    destinationRoom: RoomInfo | null;
    setDestinationRoom: (room: RoomInfo | null) => void;
    indoorTransport: string;
    setIndoorTransport: (transport: string) => void;
}