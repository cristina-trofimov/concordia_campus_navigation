import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator,Image,TouchableOpacity } from 'react-native';
import { PointAnnotation } from '@rnmapbox/maps';
import { Text } from "@rneui/themed";
import * as Location from "expo-location";
import { Coords } from "../interfaces/Map.ts";
import { MAPBOX_TOKEN } from "@env";

import axios from 'axios';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface PointOfInterestMapProps {
  myLocationCoords: { latitude: number; longitude: number } | null;
  setInputDestination: (inputDestination: string) => void;
}

const TILESET_ID = 'mapbox.mapbox-streets-v8';
const RADIUS = 5000; // will change after

const fetchNearbyRestaurants = async (longitude, latitude) => {
  const url = `https://api.mapbox.com/v4/${TILESET_ID}/tilequery/${longitude},${latitude}.json?radius=${RADIUS}&layers=poi_label&limit=10&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

 if (!data.features) {
      console.warn("No features found in API response.");
      return [];
    }

    const restaurants = data.features.filter(feature =>
      feature.properties.maki === 'fast-food'
    );

    return restaurants;
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    return [];
  }
};

const reverseGeocode = async (latitude, longitude) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const address = data.features[0].place_name; // Get the full address
      return address;
    } else {
      console.log("No address found for these coordinates");
    }
  } catch (error) {
    console.error("Error fetching address:", error);
  }
};



const onRestaurantClick = async (restaurant, setInputDestination) => {
  const coordinates = restaurant.geometry?.coordinates;
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    const [longitude, latitude] = coordinates;
    const address = await reverseGeocode(latitude, longitude);
    const trimmedAddress = address?.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
    console.log("address:",trimmedAddress); // figure the random space out
    setInputDestination(trimmedAddress || "");
  }
};

const PointOfInterestMap: React.FC<PointOfInterestMapProps> = ({ myLocationCoords }) => {
      const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
      const getLocationAndFetchRestaurants = async () => {
        if (myLocationCoords) {
          const { latitude, longitude } = myLocationCoords;
          const nearbyRestaurants = await fetchNearbyRestaurants(longitude, latitude);
          console.log(nearbyRestaurants);
          setRestaurants(nearbyRestaurants);
        }
      };
   getLocationAndFetchRestaurants();
  }, [myLocationCoords]);
    return (
        <>
            {restaurants.map((restaurant, index) => {
                      const coordinates = restaurant.geometry?.coordinates;  // Safely access geometry and coordinates
                        console.log("coord: ", myLocationCoords.longitude);
                      // Check if coordinates is a valid array and contains two values
                      if (Array.isArray(coordinates) && coordinates.length === 2) {
                        const [longitude, latitude] = coordinates; // Destructure coordinates into longitude and latitude
                        console.log(`Adding annotation for restaurant ${index}:`, coordinates);

                        return (
                          <PointAnnotation
                            key= {index}
                            id={`restaurant-${index}`}
                            coordinate={[longitude, latitude]} // Pass the coordinates to PointAnnotation
                            onSelected={() => onRestaurantClick(restaurant)} // Trigger function on click
                          >
                          <MaterialCommunityIcons name="food" size={30} color="#6E1A2A" />
                          </PointAnnotation>
                        );
                      } else {
                        console.error(`Invalid coordinates at index ${index}:`, coordinates);
                        return null; // Don't render anything if coordinates are invalid
                      }
                    })}
        </>
    );
};

export default PointOfInterestMap;