interface PointGeometry {
    type: "Point";
    coordinates: number[];
}

interface PolygonGeometry {
    type: "Polygon";
    coordinates: number[][][];
}

type Geometry = PointGeometry | PolygonGeometry;

interface IndoorFeature {
    type: "Feature";
    geometry: Geometry;
    properties: {
        [key: string]: string | boolean | number;
    };
}

export type IndoorFeatureCollection = IndoorFeature[];