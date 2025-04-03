import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { PointAnnotation } from '@rnmapbox/maps';
import { Text } from "@rneui/themed";
import * as Location from "expo-location";
import { Coords } from "../interfaces/Map.ts";
import { MAPBOX_TOKEN as ENV_MAPBOX_TOKEN } from "@env";

import axios from 'axios';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

let MAPBOX_TOKEN;
try {
  const env = require('@env');
  MAPBOX_TOKEN = env.MAPBOX_TOKEN;
} catch (e) {
  // Fallback for test environments
  console.log(e);
  MAPBOX_TOKEN = 'mock-token-for-tests';
}
interface PointOfInterestMapProps {
  myLocationCoords: { latitude; longitude } | null;
  setInputDestination: (inputDestination) => void;
  selectedPOI?: string;
  radius?: number;
}

const POI_ICONS = {
  food_and_drink: "food",
  food_and_drink_stores: "cart",
  public_facilities: "town-hall",
  store_like: "shopping",
  arts_and_entertainment: "movie",
};

export const fetchNearbyPOI = async (longitude, latitude, selectedPOI, radius = 25) => {
  const TILESET_ID = 'mapbox.mapbox-streets-v8';
  const url = `https://api.mapbox.com/v4/${TILESET_ID}/tilequery/${longitude},${latitude}.json?radius=${radius}&layers=poi_label&limit=50&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.features) {
      console.warn("No features found in API response.");
      return [];
    }

    // Fix: Check if feature.properties exists before accessing class
    const filteredPOIs = data.features.filter(feature =>
      feature.properties && feature.properties.class === selectedPOI
    );

    return filteredPOIs;
  } catch (error) {
    console.error('Error fetching nearby POI:', error);
    return [];
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      // Get the full address
      const address = data.features[0].place_name;
      return address;
    } else {
      console.log("No address found for these coordinates");
      return null;
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    return null;
  }
};

export const onPoiClick = async (poi, setInputDestination) => {
  const coordinates = poi.geometry?.coordinates;
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    const [longitude, latitude] = coordinates;
    // Note: In mapbox, coordinates are [longitude, latitude]
    // But the reverseGeocode function expects (latitude, longitude)
    const address = await reverseGeocode(latitude, longitude);
    // Fix: Make sure we don't set empty string if address is null
    setInputDestination(address ?? "Unknown location");
  }
};

const PointOfInterestMap: React.FC<PointOfInterestMapProps> = ({
  myLocationCoords,
  setInputDestination,
  selectedPOI,
  radius = 50
}) => {
  const [poi, setPoi] = useState([]);
  const [currentIcon, setCurrentIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getLocationAndFetchPois = async () => {
      setPoi([]);
      setCurrentIcon(null);
      setIsLoading(true);

      if (myLocationCoords && selectedPOI) {
        try {
          // Reduce timeout to prevent test timeouts
          await new Promise(resolve => setTimeout(resolve, 100));
          const { latitude, longitude } = myLocationCoords;
          const nearbyPois = await fetchNearbyPOI(longitude, latitude, radius, selectedPOI);

          setCurrentIcon(POI_ICONS[selectedPOI] ?? "map-marker");
          setPoi(nearbyPois);
        } catch (error) {
          console.error("Error fetching POIs:", error);
          setPoi([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    // Reduced debounce time for tests
    const timeoutId = setTimeout(getLocationAndFetchPois, 50);

    // Cleanup function
    return () => clearTimeout(timeoutId);
  }, [myLocationCoords, radius, selectedPOI]);

  // If loading, return a loading indicator in a View wrapper
  if (isLoading) {
    return (
      <View testID="loading-container">
        <ActivityIndicator size="large" color="#6E1A2A" />
      </View>
    );
  }

  return (
    <>
      {poi.map((poi, index) => {
        const coordinates = poi.geometry?.coordinates;

        if (Array.isArray(coordinates) && coordinates.length === 2) {
          const [longitude, latitude] = coordinates;

          return (
            <PointAnnotation
              key={`${selectedPOI}-${index}`}
              id={`poi-${index}`}
              coordinate={[longitude, latitude]}
              onSelected={() => onPoiClick(poi, setInputDestination)}
            >
              <MaterialCommunityIcons
                name={currentIcon}
                size={30}
                color="black"
              />
            </PointAnnotation>
          );
        } else {
          console.error(`Invalid coordinates at index ${index}:`, coordinates);
          return null;
        }
      })}
    </>
  );
};

export default PointOfInterestMap;