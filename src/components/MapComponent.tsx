import {
  Dimensions,
  View,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Mapbox, { Camera, MapView, PointAnnotation } from "@rnmapbox/maps";
import { Text } from "@rneui/themed";
import { locations } from "../data/buildingLocation.ts";
import * as Location from "expo-location";
import { useCoords } from "../data/CoordsContext.tsx";
import { useIndoor } from "../data/IndoorContext";
import ToggleButton from "./ToggleButton";
import Polyline from "@mapbox/polyline";
import { Coords } from "../interfaces/Map.ts";
import { MAPBOX_TOKEN } from "@env";

import { HighlightBuilding } from "./BuildingCoordinates.tsx";
import BuildingInformation from "./BuildingInformation.tsx";
import BuildingLocation from "../interfaces/buildingLocation.ts";
import ShuttleBusTracker from "./ShuttleBusTracker.tsx";
import { HighlightIndoorMap } from './IndoorMap.tsx'; 
import { MapComponentStyles } from "../styles/MapComponentStyles.tsx";

Mapbox.setAccessToken(MAPBOX_TOKEN);

export default function MapComponent({
  drawerHeight,
}: {
  readonly drawerHeight: Animated.Value;
}) {
  const {
    routeData: routeCoordinates,
    setmyLocationString,
    myLocationCoords,
    setMyLocationCoords,
  } = useCoords();
  const { inFloorView } = useIndoor();

  const sgwCoords = {
    latitude: 45.4949968855897,
    longitude: -73.57794614197633,
  };

  const loyolaCoords = {
    latitude: 45.45830498353995,
    longitude: -73.63917964725294,
  };

  const cameraRef = useRef<Camera | null>(null);
  const mapRef = useRef<Mapbox.MapView | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingLocation | null>(null);

  const openOverlay = (building: BuildingLocation) => {
    setSelectedBuilding(building);
    setIsOverlayVisible(true);
  };

  const closeOverlay = () => {
    setIsOverlayVisible(false);
  };
  const [decodedPolyline, setDecodedPolyline] = useState<Coords[]>([]);

  useEffect(() => {
    if (myLocationCoords) {
      const { latitude, longitude } = myLocationCoords;
      const locationString = `${latitude},${longitude}`;
      setmyLocationString(locationString);
    }
  }, [myLocationCoords, setmyLocationString]);

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      try {
        const points = Polyline.decode(
          routeCoordinates[0].overview_polyline.points
        );
        const decoded = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        const finaldecoded = decoded.map((coord) => ({
          latitude: coord.latitude,
          longitude: coord.longitude,
        }));
        setDecodedPolyline(finaldecoded);
      } catch (error) {
        console.error("Error processing route coordinates:", error);
        setDecodedPolyline([]);
      }
    } else {
      setDecodedPolyline([]);
    }

    // Focus on SGW when the app starts
    const timer = setTimeout(() => {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [sgwCoords.longitude, sgwCoords.latitude],
          zoomLevel: 17,
          animationMode: "flyTo",
          animationDuration: 1000,
        });
      } else {
        console.warn("Camera reference is not available yet");
      }
    }, 1000); // Increased delay for stability (to make sure that MapView is loaded before setting the camera)

    _getLocation();

    const locationSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 1,
      },
      (location) => {
        console.log("User location updated:", location.coords);
        setMyLocationCoords(location.coords);
      }
    );

    return () => {
      clearTimeout(timer);
      locationSubscription
        .then((subscription) => {
          subscription.remove();
        })
        .catch((error) => {
          console.warn("Error unsubscribing from location updates:", error);
        });
    };
  }, [routeCoordinates]);

  // Trigger a re-render when the user location changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [myLocationCoords]);

  const _getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log("User location received:", location.coords);
      setMyLocationCoords(location.coords);
    } catch (err) {
      console.warn("Error getting location:", err);
    }
  };

  const focusOnLocation = () => {
    if (!myLocationCoords || !cameraRef.current || !mapLoaded) {
      console.warn("User location, camera, or map not available.");
      return;
    }

    cameraRef.current.setCamera({
      centerCoordinate: [myLocationCoords.longitude, myLocationCoords.latitude],
      zoomLevel: 17,
      animationMode: "flyTo",
      animationDuration: 1000,
    });
  };

  const handleCampusChange = (isSGW: boolean) => {
    const coords = isSGW ? sgwCoords : loyolaCoords;

    if (mapLoaded && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: 17,
        animationMode: "flyTo",
        animationDuration: 1000,
      });
    } else {
      console.warn("Error loading campus");
    }
  };

  return (
    <View style={MapComponentStyles.container}>
      <BuildingInformation
        isVisible={isOverlayVisible}
        onClose={closeOverlay}
        buildingLocation={selectedBuilding}
      />
      <MapView
        style={MapComponentStyles.map}
        ref={mapRef}
        onDidFinishLoadingMap={() => setMapLoaded(true)}
      >
        <HighlightBuilding/>
        <HighlightIndoorMap/>
        <Camera
          ref={(ref) => {
            cameraRef.current = ref;
          }}
          zoomLevel={17}
          centerCoordinate={[sgwCoords.longitude, sgwCoords.latitude]}
        />

        {locations.map((location) => (
          <Mapbox.PointAnnotation
            key={location.id.toString()}
            id={`point-${location.id}`}
            coordinate={location.coordinates}
            style={{ zIndex: 1 }}
            onSelected={() => {
              openOverlay(location);
            }}
          >
            <View style={MapComponentStyles.marker}>
              <Text style={MapComponentStyles.markerText}>📍</Text>
            </View>
          </Mapbox.PointAnnotation>
        ))}

        {myLocationCoords && (
          <PointAnnotation
            key={`<span class="math-inline">{myLocation.latitude}-</span>{myLocation.longitude}-${forceUpdate}`}
            id="my-location"
            coordinate={[myLocationCoords.longitude, myLocationCoords.latitude]}
          >
            <Image
              source={require("../resources/images/currentLocation-Icon.png")}
              style={{ width: 30, height: 30 }}
            />
          </PointAnnotation>
        )}

        {decodedPolyline.length > 0 && (
          <Mapbox.ShapeSource
            id="routeSource"
            shape={{
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: decodedPolyline.map((point) => [
                      point.longitude,
                      point.latitude,
                    ]),
                  },
                  properties: {},
                },
              ],
            }}
          >
            <Mapbox.LineLayer
              id="routeLayer"
              style={{
                lineColor: "#ff0000",
                lineWidth: 4,
                lineOpacity: 0.8,
              }}
            />
            <Mapbox.LineLayer
              id="routeLayer"
              style={{
                lineColor: "#3399FF",
                lineWidth: 4,
                lineOpacity: 0.8,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* Add ShuttleBusMarkers component */}
        <ShuttleBusTracker />
      </MapView>

      <Animated.View
        style={[
          MapComponentStyles.buttonContainer,
          {
            bottom: drawerHeight.interpolate({
              inputRange: [
                Dimensions.get("window").height * 0.1,
                Dimensions.get("window").height * 0.5,
                Dimensions.get("window").height * 0.85,
              ],
              outputRange: [
                Dimensions.get("window").height * 0.1 + 10,
                Dimensions.get("window").height * 0.5 + 10,
                Dimensions.get("window").height * 0.5 + 10, // Keep position fixed when drawer is fully open
              ],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <TouchableOpacity onPress={focusOnLocation} style={MapComponentStyles.imageButton}>
          <Image
            source={require("../resources/images/currentLocation-button.png")}
            style={MapComponentStyles.buttonImage}
          />
        </TouchableOpacity>
      </Animated.View>

      <View style={MapComponentStyles.toggleButtonContainer}>
        <ToggleButton
          mapRef={mapRef}
          sgwCoords={sgwCoords}
          loyolaCoords={loyolaCoords}
          onCampusChange={handleCampusChange}
          initialCampus={true}
        />
      </View>
    </View>
  );
}
