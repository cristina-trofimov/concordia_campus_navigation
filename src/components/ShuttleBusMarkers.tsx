import React from 'react';
import { PointAnnotation } from '@rnmapbox/maps';
import { Image } from 'react-native';

type Point = {
    ID: string;
    Latitude: number;
    Longitude: number;
    IconImage: string;
};

type ShuttleBusMarkersProps = {
    busData: {
        Points: Point[];
    };
};

const ShuttleBusMarkers: React.FC<ShuttleBusMarkersProps> = ({ busData }) => {
    if (!busData || !busData.Points) {
        return null;
    }

    // Filter the Points array to include only buses (IDs starting with "BUS")
    const busPoints = busData.Points.filter((point) => point.ID.startsWith('BUS'));

    console.log('Filtered Bus Points:', busPoints);

    return (
        <>
            {busPoints.map((point) => (
                <PointAnnotation
                    key={point.ID}
                    id={point.ID}
                    coordinate={[point.Longitude, point.Latitude]}
                >
                    <Image
                        source={require('../resources/images/ShuttleBus-Icon.png')} 
                        style={{ width: 100, height: 40 }}
                    />
                </PointAnnotation>
            ))}
        </>
    );
};

export default ShuttleBusMarkers;