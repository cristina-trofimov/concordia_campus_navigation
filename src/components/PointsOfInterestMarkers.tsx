import Mapbox from "@rnmapbox/maps";
import centroid from "@turf/centroid";
import React from "react";
import { View } from "react-native";

export const PointsOfInterestMarkers = ({
    features,
    filter,
    iconComponent,
    iconSize,
    iconColor,
}: {
    features: any[];
    filter: (feature: any) => boolean;
    iconComponent: React.ReactElement;
    iconSize: number;
    iconColor: string;
}) => {
    return features
        .filter(filter)
        .map((feature, index) => {
            const centroidCoords = centroid(feature).geometry.coordinates;

            return (
                <Mapbox.PointAnnotation
                    key={index.toString()}
                    id={`${filter.name}-marker-${index}`}
                    coordinate={centroidCoords}
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                        {React.cloneElement(iconComponent, { size: iconSize, color: iconColor })}
                    </View>
                </Mapbox.PointAnnotation>
            );
        });
};