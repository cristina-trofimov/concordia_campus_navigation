import React from 'react'
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const SettingsButton = () => {
    return (
        <TouchableOpacity style={styles.button} >
          <Image source={require('../../src/resources/images/icons8-menu.png')}
            style={styles.image}
          />
        </TouchableOpacity>
      );
    };
  
    const styles = StyleSheet.create({
      button: {
          position: 'absolute', 
          top: 10,
          left: 10,
          height: 40,
          width: 40,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          borderRadius: 5,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          zIndex: 1,
      },
      image: {
          margin: 5,
          height: 30,
          width: 30
      },
    });

export default SettingsButton