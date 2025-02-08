import { Dimensions, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Mapbox, { Camera, MarkerView } from '@rnmapbox/maps';
import * as Location from 'expo-location';

const MAPBOX_TOKEN = 'sk.eyJ1IjoibWlkZHkiLCJhIjoiY202c2ZqdW03MDhjMzJxcTUybTZ6d3k3cyJ9.xPp9kFl0VC1SDnlp_ln2qA';

Mapbox.setAccessToken(MAPBOX_TOKEN);

export default function Map() {
  const sgwCoords = {
    latitude: 45.4949968855897,
    longitude: -73.57794614197633,
  };

  const loyolaCoords = {
    latitude: 45.45822972841337,
    longitude: -73.63915818932158,
  };

  const cameraRef = useRef<Camera | null>(null);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Focus on SGW when the app starts
    const timer = setTimeout(() => {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [sgwCoords.longitude, sgwCoords.latitude],
          zoomLevel: 17,
          animationMode: 'flyTo',
          animationDuration: 1000, 
        });
      } else {
        console.warn("Camera reference is not available yet");
      }
    }, 1000); // Increased delay for stability (to make sure that MapView is loaded before setting the camera)
  
    _getLocation();
  
    return () => clearTimeout(timer);
  }, []);  

  const _getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      console.log("User location received:", location.coords);
      setMyLocation(location.coords);
    } catch (err) {
      console.warn("Error getting location:", err);
    }
  };  

  const focusOnLocation = () => {
    if (!myLocation) {
      console.warn("User location not available yet.");
      return;
    }
  
    if (!cameraRef.current) {
      console.warn("Camera reference is null.");
      return;
    }
  
    cameraRef.current.setCamera({
      centerCoordinate: [myLocation.longitude, myLocation.latitude],
      zoomLevel: 17,
      animationMode: 'flyTo',
      animationDuration: 1000,
    });
  };  

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        onDidFinishLoadingMap={() => {
          if (!cameraRef.current) {
            console.warn("Camera reference not available yet.");
            return;
          }
        
          setTimeout(() => {
            cameraRef.current?.setCamera({
              centerCoordinate: [sgwCoords.longitude, sgwCoords.latitude],
              zoomLevel: 17,
              animationMode: 'flyTo',
              animationDuration: 1000,
            });
          }, 500); // Small delay to ensure the map is fully ready
        }}        
      >
        <Camera
          ref={(ref) => { cameraRef.current = ref; }}
          zoomLevel={17} 
          centerCoordinate={[sgwCoords.longitude, sgwCoords.latitude]}
        />
        {myLocation && (
          <Mapbox.PointAnnotation
            key={`${myLocation.latitude}-${myLocation.longitude}`}
            id="my-location"
            coordinate={[myLocation.longitude, myLocation.latitude]}
          >
            <Image 
              source={require('../resources/images/currentLocation-Icon.png')} 
              style={{ width: 30, height: 30 }}
            />
          </Mapbox.PointAnnotation>        
        )}
      </Mapbox.MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={focusOnLocation} style={styles.imageButton}>
          <Image
            source={require('../resources/images/currentLocation-button.png')}
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
  imageButton: {
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 25,
  },
});
