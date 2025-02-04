import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';
import MapView, { Callout, Marker } from 'react-native-maps';

export default function CustomMarker({ coordinate, title, image }) {
    //console.log('my location', coordinate);
  return (
    <Marker coordinate={{
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
    }}>
        <View style={styles.markerContainer}>
            <Image source={image} style={styles.markerImage} />
        </View>
        <Callout tooltip>
          <View>
            <Text>{title}</Text>
          </View>
        </Callout>
      </Marker>
  )
}

const styles = StyleSheet.create({
    
    markerImage: {
      width: '100%', 
      height: '100%', 
    },
    markerContainer: {
        width: 30,
        height: 30,
        borderRadius: 50,
        borderColor: '#912338',
        borderWidth: 4,
        backgroundColor: '#DBDBDB',
        overflow: 'hidden'
    }
  });
  