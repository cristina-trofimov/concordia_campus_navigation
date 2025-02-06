import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

export default function CustomMarker({ coordinate, title, image }) {
  return (
    <MapboxGL.PointAnnotation
      id="marker"
      coordinate={[coordinate.longitude, coordinate.latitude]}
    >
      <View style={styles.markerContainer}>
        <Image source={image} style={styles.markerImage} />
      </View>
      <MapboxGL.Callout title={title} />
    </MapboxGL.PointAnnotation>
  );
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
    overflow: 'hidden',
  },
});