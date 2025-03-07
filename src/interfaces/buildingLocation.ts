import BuildingInfo from "./buildingLocationInfo";

export default interface BuildingLocation {
    id: number;
    coordinates: [number, number];
    title: string;
    buildingInfo: BuildingInfo
    description: string;
};