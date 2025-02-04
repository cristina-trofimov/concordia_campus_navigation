import { Button, Dimensions, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'; 
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import CustomMarker from './CustomMarker';

export default function Map() {
  // initial location
  const sgwCoords = {
    latitude: 45.4949968855897,
    longitude: -73.57794614197633,
  };

  const loyolaCoords = {
    latitude: 45.45825983047423, 
    longitude: -73.6389114260919
  };

  const [myLocation, setMyLocation] = useState(sgwCoords);
  const [region, setRegion] = useState({
    latitude: sgwCoords.latitude,
    longitude: sgwCoords.longitude,
    latitudeDelta: 0.0100,
    longitudeDelta: 0.0100,
  });

  const mapRef = useRef(null);

  useEffect(() => {
    _getLocation();
  }, []);

  // Get the current location of the user
  const _getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setMyLocation(location.coords);
      console.log(location);
    } catch (err) {
      console.warn(err);
    }
  };

  // Focus on the current location of the user
  const focusOnLocation = () => {
    if (myLocation.latitude && myLocation.longitude) {
      const newRegion = {
        latitude: parseFloat(myLocation.latitude),
        longitude: parseFloat(myLocation.longitude),
        latitudeDelta: 0.0100,
        longitudeDelta: 0.0100,
      };
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        ref={mapRef}
        provider="google"
      >
        {myLocation.latitude && myLocation.longitude && (
          <CustomMarker
            coordinate={{
              latitude: myLocation.latitude,
              longitude: myLocation.longitude,
            }}
            title="My current location"
            image={require('../assets/currentLocation-Icon.png')}
          />
        )}

      </MapView>

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
  imageButton: {

  },
  buttonImage: {
    width: 50, 
    height: 50, 
    resizeMode: 'contain', 
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});