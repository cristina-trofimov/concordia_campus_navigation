import Mapbox from "@rnmapbox/maps";
import { useIndoor } from "../data/IndoorContext";
import { View } from "react-native";
import { FontAwesome5, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import centroid from "@turf/centroid";

export const IndoorPointsOfInterest = () => {
    const { inFloorView, indoorFeatures } = useIndoor();

    return (
        <>
            {/* Toilets */}
            {inFloorView && indoorFeatures
                .filter((feature) => feature.properties?.amenity === "toilets" && feature.geometry.type === "Polygon")
                .map((feature, index) => {
                    // Calculate the centroid of the polygon
                    const centroidCoords = centroid(feature).geometry.coordinates;

                    return (
                        <Mapbox.PointAnnotation
                            key={index.toString()}
                            id={`toilet-marker-${index}`}
                            coordinate={centroidCoords}
                        >
                            <View style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                                <FontAwesome5 name="restroom" size={23} color="#007AFF" />
                            </View>
                        </Mapbox.PointAnnotation>
                    );
                })}

            {/* Elevators */}
            {inFloorView && indoorFeatures
                .filter((feature) => feature.properties?.highway === "elevator" && feature.geometry.type === "Polygon")
                .map((feature, index) => {
                    // Calculate the centroid of the polygon
                    const centroidCoords = centroid(feature).geometry.coordinates;

                    return (
                        <Mapbox.PointAnnotation
                            key={index.toString()}
                            id={`elevator-marker-${index}`}
                            coordinate={centroidCoords}
                        >
                            <View style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                                <FontAwesome6 name="elevator" size={28} color="dark grey" />
                            </View>
                        </Mapbox.PointAnnotation>
                    );
                })}

            {/* Escalators */}
            {inFloorView && indoorFeatures
                .filter((feature) => feature.properties?.escalators === "yes" && feature.geometry.type === "Polygon")
                .map((feature, index) => {
                    // Calculate the centroid of the polygon
                    const centroidCoords = centroid(feature).geometry.coordinates;

                    return (
                        <Mapbox.PointAnnotation
                            key={index.toString()}
                            id={`escalator-marker-${index}`}
                            coordinate={centroidCoords}
                        >
                            <View style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                                <MaterialCommunityIcons name="escalator" size={35} color="#B16200" />
                            </View>
                        </Mapbox.PointAnnotation>
                    );
                })}

            {/* Stairs */}
            {inFloorView && indoorFeatures
                .filter((feature) => feature.properties?.highway === "steps" && feature.geometry.type === "Polygon")
                .map((feature, index) => {
                    // Calculate the centroid of the polygon
                    const centroidCoords = centroid(feature).geometry.coordinates;

                    return (
                        <Mapbox.PointAnnotation
                            key={index.toString()}
                            id={`stairs-marker-${index}`}
                            coordinate={centroidCoords}
                        >
                            <View style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                                <FontAwesome6 name="stairs" size={25} color="#8B4513" />
                            </View>
                        </Mapbox.PointAnnotation>
                    );
                })}

            {/* Cafes */}
            {inFloorView && indoorFeatures
                .filter((feature) => feature.properties?.amenity === "cafe" && feature.geometry.type === "Polygon")
                .map((feature, index) => {
                    // Calculate the centroid of the polygon
                    const centroidCoords = centroid(feature).geometry.coordinates;

                    return (
                        <Mapbox.PointAnnotation
                            key={index.toString()}
                            id={`cafe-marker-${index}`}
                            coordinate={centroidCoords}
                        >
                            <View style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 }}>
                                <FontAwesome5 name="coffee" size={25} color="#422B25" />
                            </View>
                        </Mapbox.PointAnnotation>
                    );
                })}
        </>
    );
};