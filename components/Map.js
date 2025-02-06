import { Dimensions, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Mapbox, { Camera, MarkerView } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import CustomMarker from './CustomMarker';

// Set your Mapbox access token
Mapbox.setAccessToken('sk.eyJ1IjoibWlkZHkiLCJhIjoiY202c2ZqdW03MDhjMzJxcTUybTZ6d3k3cyJ9.xPp9kFl0VC1SDnlp_ln2qA');

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
  const cameraRef = useRef(null);

  useEffect(() => {
    // Focus on SGW when the app starts
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        center: [sgwCoords.longitude, sgwCoords.latitude],
        zoom: 14,
        animationDuration: 1000,
      });
    }

    _getLocation();
  }, []);

  const _getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setMyLocation(location.coords);
    } catch (err) {
      console.warn(err);
    }
  };

  const focusOnLocation = () => {
    if (myLocation) {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          center: [myLocation.longitude, myLocation.latitude],
          zoom: 14,
          animationDuration: 1000,
        });
      }
    } else {
      console.warn("User location not available yet.");
    }
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Camera
          ref={cameraRef}
          defaultSettings={{
            center: [sgwCoords.longitude, sgwCoords.latitude],
            zoom: 14,
          }}
        />
        {myLocation && (
          <MarkerView
            key={`${myLocation.latitude}-${myLocation.longitude}`}
            coordinate={[myLocation.longitude, myLocation.latitude]}
          >
            <CustomMarker
              title="My current location"
              image={require('../assets/currentLocation-Icon.png')}
              coordinate={{ latitude: myLocation.latitude, longitude: myLocation.longitude }}
            />
          </MarkerView>
        )}
      </Mapbox.MapView>

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