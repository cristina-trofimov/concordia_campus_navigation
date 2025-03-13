export interface GoogleObject {
    __type: string;
    Directions: {
        Addresses: any[];
        Locale: string;
        ShowDirectionInstructions: boolean;
        HideMarkers: boolean;
        PolylineOpacity: number;
        PolylineWeight: number;
        PolylineColor: string;
    };
    Points: Point[];
    Polylines: any[];
    Polygons: any[];
    CenterPoint: Point;
    ZoomLevel: number;
    ShowZoomControl: boolean;
    RecenterMap: boolean;
    AutomaticBoundaryAndZoom: boolean;
    ShowTraffic: boolean;
    ShowMapTypesControl: boolean;
    Width: string;
    Height: string;
    MapType: string;
    APIKey: string;
    APIVersion: string;
}

interface Point {
    PointStatus: string;
    Address: string;
    ID: string;
    IconImage: string;
    IconShadowImage: string;
    IconImageWidth: number;
    IconShadowWidth: number;
    IconShadowHeight: number;
    IconAnchor_posX: number;
    IconAnchor_posY: number;
    InfoWindowAnchor_posX: number;
    InfoWindowAnchor_posY: number;
    Draggable: boolean;
    IconImageHeight: number;
    Latitude: number;
    Longitude: number;
    InfoHTML: string;
    ToolTip: string;
}

export interface BusDataResponse {
    d: GoogleObject;
}
