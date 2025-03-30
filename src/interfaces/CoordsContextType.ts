export interface CoordsContextType {
    routeData: any;
    setRouteData: (data: any) => void;
    isInsideBuilding: boolean;
    setIsInsideBuilding: (isInside: boolean) => void;
    myLocationString: string;
    setmyLocationString: (location: string) => void;
    isTransit: boolean;
    setIsTransit: (isTransit: boolean) => void;
    highlightedBuilding: any;
    setHighlightedBuilding: (building: any) => void;
    myLocationCoords: { latitude: number; longitude: number } | null;
    setMyLocationCoords: (location: { latitude: number; longitude: number }) => void;
    originCoords: any;
    setOriginCoords: (originCoords: any) => void;
    destinationCoords: any;
    setDestinationCoords: (destinationCoords: any) => void;
}
