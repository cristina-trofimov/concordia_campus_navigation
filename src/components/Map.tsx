// Map.tsx
import { Dimensions, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Mapbox, { Camera, MarkerView } from '@rnmapbox/maps';
import { MapboxGLEvent } from '@rnmapbox/maps/lib/typescript/src/types';
import * as Location from 'expo-location';
import ToggleButton from './ToggleButton';

<<<<<<< HEAD:components/Map.tsx

Mapbox.setAccessToken('ACCESS_TOKEN');
=======
const MAPBOX_TOKEN = 'sk.eyJ1IjoibWlkZHkiLCJhIjoiY202c2ZqdW03MDhjMzJxcTUybTZ6d3k3cyJ9.xPp9kFl0VC1SDnlp_ln2qA';

Mapbox.setAccessToken(MAPBOX_TOKEN);
>>>>>>> 6daa999eb32fbb355705382902e71e144cf23418:src/components/Map.tsx

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

    useEffect(() => {
        _getLocation();

<<<<<<< HEAD:components/Map.tsx
=======
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
>>>>>>> 6daa999eb32fbb355705382902e71e144cf23418:src/components/Map.tsx
        
        if (mapLoaded && cameraRef.current) {
            cameraRef.current.setCamera({
                centerCoordinate: [currentCoords.longitude, currentCoords.latitude],
                zoomLevel: 17,
                animationMode: 'flyTo',
                animationDuration: 1000,
            });
<<<<<<< HEAD:components/Map.tsx
        }
    }, [mapLoaded]);

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
            <Mapbox.MapView
                style={styles.map}
                ref={mapRef}
                onDidFinishLoadingMap={() => setMapLoaded(true)}
            >
                <Camera
                    ref={(ref) => (cameraRef.current = ref)}
                    zoomLevel={17}
                    centerCoordinate={[currentCoords.longitude, currentCoords.latitude]}
                />
                {myLocation && (
                    <Mapbox.PointAnnotation
                        key={`${myLocation.latitude}-${myLocation.longitude}`}
                        id="my-location"
                        coordinate={[myLocation.longitude, myLocation.latitude]}
                    >
                        <Image
                            source={require('../assets/currentLocation-Icon.png')}
                            style={styles.annotationImage}
                        />
                    </Mapbox.PointAnnotation>
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
=======
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
>>>>>>> 6daa999eb32fbb355705382902e71e144cf23418:src/components/Map.tsx
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