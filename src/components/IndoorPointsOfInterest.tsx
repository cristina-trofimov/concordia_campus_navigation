import { useIndoor } from "../data/IndoorContext";
import { FontAwesome5, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import { PointsOfInterestMarkers } from "./PointsOfInterestMarkers";
import React from "react";

export const IndoorPointsOfInterest = () => {
    const { inFloorView, indoorFeatures } = useIndoor();

    if (!inFloorView || !indoorFeatures) return null;

    return (
        <>
            {/* Toilets */}
            <PointsOfInterestMarkers
                features={indoorFeatures}
                filter={(feature) => feature.properties?.amenity === "toilets" && feature.geometry.type === "Polygon"}
                iconComponent={<FontAwesome5 name="restroom" />}
                iconSize={23}
                iconColor="#007AFF"
            />

            {/* Elevators */}
            <PointsOfInterestMarkers
                features={indoorFeatures}
                filter={(feature) => feature.properties?.highway === "elevator" && feature.geometry.type === "Polygon"}
                iconComponent={<FontAwesome6 name="elevator" />}
                iconSize={28}
                iconColor="dark grey"
            />

            {/* Escalators */}
            <PointsOfInterestMarkers
                features={indoorFeatures}
                filter={(feature) => feature.properties?.escalators === "yes" && feature.geometry.type === "Polygon"}
                iconComponent={<MaterialCommunityIcons name="escalator" />}
                iconSize={35}
                iconColor="#B16200"
            />

            {/* Stairs */}
            <PointsOfInterestMarkers
                features={indoorFeatures}
                filter={(feature) => feature.properties?.highway === "steps" && feature.geometry.type === "Polygon"}
                iconComponent={<FontAwesome6 name="stairs" />}
                iconSize={25}
                iconColor="#8B4513"
            />

            {/* Cafes */}
            <PointsOfInterestMarkers
                features={indoorFeatures}
                filter={(feature) => feature.properties?.amenity === "cafe" && feature.geometry.type === "Polygon"}
                iconComponent={<FontAwesome5 name="coffee" />}
                iconSize={25}
                iconColor="#422B25"
            />
        </>
    );
};