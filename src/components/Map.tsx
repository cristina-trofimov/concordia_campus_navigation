// Map.tsx
import { Dimensions, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Mapbox, { Camera, MapView, PointAnnotation, MarkerView } from '@rnmapbox/maps';
import { MapboxGLEvent } from '@rnmapbox/maps/lib/typescript/src/types';
import * as Location from 'expo-location';
import ToggleButton from './ToggleButton';


Mapbox.setAccessToken('ACCESS_TOKEN');

export default function Map() {
    const sgwCoords = {
        latitude: 45.4949968855897,
        longitude: -73.57794614197633,
    };

    const loyolaCoords = {
        latitude: 45.45830498353995,
        longitude: -73.63917964725294
    };

  const cameraRef = useRef<Camera | null>(null);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<Mapbox.MapView | null>(null);
  const [currentCoords, setCurrentCoords] = useState(sgwCoords);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

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
  
    const locationSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 1,
      },
      (location) => {
        console.log("User location updated:", location.coords);
        setMyLocation(location.coords);
      }
    );

    return () => {
      clearTimeout(timer);

      locationSubscription.then((subscription) => {
        subscription.remove();
      }).catch((error) => {
        console.warn("Error unsubscribing from location updates:", error);
      });
    }
  }, []);  

  // Trigger a re-render when the user location changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [myLocation]);

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
    if (!myLocation || !cameraRef.current || !mapLoaded) { // Check mapLoaded
        console.warn("User location, camera, or map not available.");
        return;
    }

    cameraRef.current.setCamera({
        centerCoordinate: [myLocation.longitude, myLocation.latitude],
        zoomLevel: 17,
        animationMode: 'flyTo',
        animationDuration: 1000,
    });
  };

  const handleCampusChange = (isSGW: boolean) => {
    const coords = isSGW ? sgwCoords : loyolaCoords;
    setCurrentCoords(coords);

    if (mapLoaded && cameraRef.current) {
        cameraRef.current.setCamera({
            centerCoordinate: [coords.longitude, coords.latitude],
            zoomLevel: 17,
            animationMode: 'flyTo',
            animationDuration: 1000,
        });
    } else {
        console.warn("Error loading campus");
    }
};

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        onDidFinishLoadingMap={() => setMapLoaded(true)}
      >
        <Camera
          ref={(ref) => { cameraRef.current = ref; }}
          zoomLevel={17} 
          centerCoordinate={[sgwCoords.longitude, sgwCoords.latitude]}
        />
        {myLocation && (
          <PointAnnotation
            key={`${myLocation.latitude}-${myLocation.longitude}-${forceUpdate}`}
            id="my-location"
            coordinate={[myLocation.longitude, myLocation.latitude]}
          >
            <Image 
              source={require('../resources/images/currentLocation-Icon.png')} 
              style={{ width: 30, height: 30 }}
            />
          </PointAnnotation>        
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={focusOnLocation} style={styles.imageButton}>
          <Image
            source={require('../resources/images/currentLocation-button.png')}
            style={styles.buttonImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.toggleButtonContainer}>
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
    annotationImage: {
        width: 30,
        height: 30,
    },
    toggleButtonContainer: {
        position: 'absolute',
        top: 20,
        alignItems: 'center',
    },
});