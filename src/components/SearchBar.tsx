import React, { useCallback, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {Prediction, SearchBarProps } from "../interfaces/SearchBar";

const GOOGLE_PLACES_API_KEY = "AIzaSyDVeg6jawwGFbwdBH7y_qlpXfXuZkkLtUU";



const SearchBarComponent: React.FC<SearchBarProps> = ({ placeholder, onSelect, setCoords }) => {
  const [query, setQuery] = useState("");
  const [displayedPlace, setDisplayedPlace] = useState("");
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input: text,
            key: GOOGLE_PLACES_API_KEY,
          },
        }
      );
      setSuggestions(response.data.predictions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSuggestionPress = useCallback(async (item: Prediction) => {
    const selectedPlace = item.description;
    setDisplayedPlace(selectedPlace);
    setQuery("");
    setSuggestions([]);

    try {
      const geocodingResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            place_id: item.place_id,
            key: GOOGLE_PLACES_API_KEY,
          },
        }
      );

      if (geocodingResponse.data.status === 'OK') {
        const location = geocodingResponse.data.results[0].geometry.location;
        const coords = { latitude: location.lat, longitude: location.lng };
        setCoords(coords);
        onSelect(selectedPlace, coords);
      } else {
        console.error("Geocoding Error:", geocodingResponse.data.status);
      }
    } catch (error) {
      console.error("Error in geocoding:", error);
    }
  }, [onSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={displayedPlace ? displayedPlace : query}
          onChangeText={(text) => {
            setQuery(text);
            setDisplayedPlace("");
            fetchSuggestions(text);
          }}
        />
      </View>
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(item)}
          >
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});

export default SearchBarComponent;