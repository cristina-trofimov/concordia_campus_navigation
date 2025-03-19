export interface CoordsContextType {
    routeData: any;
    setRouteData: (data: any) => void;
    isInsideBuilding: boolean;
    setIsInsideBuilding: (isInside: boolean) => void;
    myLocationString: string;
    setmyLocationString: (location: string) => void;
    isTransit: boolean;
    setIsTransit: (isTransit: boolean) => void;

}