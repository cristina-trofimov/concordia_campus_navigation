import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import the icon library

const SearchBar = () => {
  return (
    <View style={styles.container}>
      {/* Centered Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Find your way around campus</Text>
      </View>

      {/* Search Bar */}
      <GooglePlacesAutocomplete
        placeholder="Where to?"
        onPress={(data, details = null) => {
          console.log(data, details); // Handle the selected place
        }}
        query={{
          key: 'AIzaSyDVeg6jawwGFbwdBH7y_qlpXfXuZkkLtUU', // For now using Google Maps sdk Api
          language: 'en', // Language of the results
        }}
        styles={{
          textInput: styles.searchInput,
          listView: styles.listView,
        }}
        renderLeftButton={() => (
          <View style={styles.searchIcon}>
            <MaterialIcons name="search" size={24} color="#666" /> {/* Grey and larger icon */}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%', // Takes up 30% of the screen height
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center', // Center the title horizontally
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0', // Grey background for the search bar
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 40, // Space for the search icon
    paddingLeft: 40, // Ensure text doesn't overlap the icon
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    top: 8, // Adjust vertical alignment
    zIndex: 1,
  },
  listView: {
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 10,
    elevation: 3,
  },
});

export default SearchBar;