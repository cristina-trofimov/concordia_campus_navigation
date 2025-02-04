import { Dimensions, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import CustomMarker from './CustomMarker';
import ToggleButton from './toggleButton';


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

    _getLocation();
  }
    , []);

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
        <Polygon coordinates={[{ latitude: 45.497709441485306, longitude: -73.5790341480075 },
        { latitude: 45.49737298229737, longitude: -73.57833781758659 },
        { latitude: 45.496829618863075, longitude: -73.57884950710131 },
        { latitude: 45.49716439702004, longitude: -73.57954413762752 }]}
          fillColor={'rgba(0, 200, 0, 0.3)'}
          strokeWidth={1}>
        </Polygon>

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

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={focusOnLocation} style={styles.imageButton}>
          <Image
            source={require('../assets/currentLocation-button.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </View>

      <ToggleButton mapRef={mapRef} sgwCoords={sgwCoords} loyolaCoords={loyolaCoords} />
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
