import { Dimensions, StyleSheet, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native'; 
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import CustomMarker from './CustomMarker';

export default function Map() {
  const sgwCoords = {
    latitude: 45.4949968855897,
    longitude: -73.57794614197633,
  };

  const loyolaCoords = {
    latitude: 45.45822972841337, 
    longitude: -73.63915818932158,
  };

  const [myLocation, setMyLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    // Focus on SGW when the app starts
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: sgwCoords.latitude,
        longitude: sgwCoords.longitude,
        latitudeDelta: 0.0100,
        longitudeDelta: 0.0100,
      }, 1000);
    }

    startWatchingLocation(); 
  }, []);

  const startWatchingLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      // Get the initial location
      let location = await Location.getCurrentPositionAsync({});
      setMyLocation(location.coords);
      setIsLoading(false);

      // Watch for location updates
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        (location) => {
          setMyLocation(location.coords);
        }
      );
    } catch (err) {
      console.warn(err);
      setIsLoading(false);
    }
  };

  const focusOnLocation = () => {
    if (myLocation) {
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: myLocation.latitude,
          longitude: myLocation.longitude,
          latitudeDelta: 0.0100,
          longitudeDelta: 0.0100,
        }, 1000);
      }
    } else {
      console.warn("User location not available yet.");
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <MapView
          style={styles.map}
          ref={mapRef}
          provider="google"
          initialRegion={{
            latitude: sgwCoords.latitude,
            longitude: sgwCoords.longitude,
            latitudeDelta: 0.0100,
            longitudeDelta: 0.0100,
          }}
        >
          {myLocation && (
            <CustomMarker
              key={`${myLocation.latitude}-${myLocation.longitude}`} 
              coordinate={{
                latitude: myLocation.latitude,
                longitude: myLocation.longitude,
              }}
              title="My current location"
              image={require('../assets/currentLocation-Icon.png')}
            />
          )}
        </MapView>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={focusOnLocation} style={styles.imageButton}>
          <Image
            source={require('../assets/currentLocation-button.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20, 
    alignItems: 'center',
  },
  buttonImage: {
    width: 50, 
    height: 50, 
    resizeMode: 'contain', 
  },
});