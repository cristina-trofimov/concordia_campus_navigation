export interface CoordsContextType {
    routeData: any;
    setRouteData: (data: any) => void;
    isInsideBuilding: boolean;
    setIsInsideBuilding: (isInside: boolean) => void;
    myLocationString: string;
    setmyLocationString: (location: string) => void;
    isTransit: boolean;
    setIsTransit: (isTransit: boolean) => void;
    buildingHasFloors: boolean;
    setBuildingHasFloors: (hasFloors: boolean) => void;
    highlightedBuilding: any;
    setHighlightedBuilding: (building: any) => void;
    myLocationCoords: { latitude: number; longitude: number } | null;
    setMyLocationCoords: (location: { latitude: number; longitude: number }) => void;
    inFloorView: boolean;
    setInFloorView: (inFloorView: boolean) => void;
    currentFloor: string | null;
    setCurrentFloor: (floor: string | null) => void;
}