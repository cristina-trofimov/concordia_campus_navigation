import React from 'react';
import { Polygon } from 'react-native-maps';

const polygons = [
    [
        { latitude: 45.497709441485306, longitude: -73.5790341480075 },
        { latitude: 45.49737298229737, longitude: -73.57833781758659 },
        { latitude: 45.496829618863075, longitude: -73.57884950710131 },
        { latitude: 45.49716439702004, longitude: -73.57954413762752 }
    ],
    [
        { latitude: 45.498709441485306, longitude: -73.5800341480075 },
        { latitude: 45.49837298229737, longitude: -73.57933781758659 },
        { latitude: 45.497829618863075, longitude: -73.57984950710131 },
        { latitude: 45.49816439702004, longitude: -73.58054413762752 }
    ]

];

const PolygonBuildings = () => {
    return (
        <>
            {polygons.map((polygonCoordinates, index) => (
                <Polygon
                    key={index}
                    coordinates={polygonCoordinates}
                    fillColor={'rgba(0, 200, 0, 0.3)'}
                    strokeWidth={1}
                />
            ))}
        </>
    );
};

export default PolygonBuildings;