
interface Coordinate {
    latitude: number;
    longitude: number;
}

interface RouteSegment {
    mode: 'WALKING' | 'TRANSIT' | 'DRIVING' | 'BICYCLING';
    coordinates: Coordinate[];
}