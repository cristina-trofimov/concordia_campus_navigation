import React, { useCallback, useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import axios from "axios";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Prediction,SearchBarProps } from "../interfaces/SearchBar";
import { SearchBarStyle } from "../styles/SearchBarStyle";
import { GOOGLE_PLACES_API_KEY } from "@env";



const SearchBarComponent: React.FC<SearchBarProps> = ({
  placeholder,
  onSelect,
  setCoords,
  defaultValue = null,
  showClearButton = false,
  onClear
}) => {
  //QUERY IS TEXT BEING WRITTEN
  //DISPLAYED TEXT IS LOCATION SELECTD
  const [query, setQuery] = useState("");
  const [displayedPlace, setDisplayedPlace] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);

  //WHEN YOU ADD A DEFAULT VALUE, IT WILL SET IT AS THE LOCATION SELECTED
  useEffect(() => {
    if (defaultValue) {
      setDisplayedPlace(defaultValue);
    }
  }, [defaultValue]);

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
  }, [onSelect, setCoords]);

  const handleClear = () => {
    setDisplayedPlace("");
    setQuery("");
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={SearchBarStyle.container}>
      <View style={SearchBarStyle.inputContainer}>
        <MaterialIcons name="search" size={24} color="#666" style={SearchBarStyle.searchIcon} />
        <TextInput
          style={SearchBarStyle.searchInput}
          placeholder={placeholder}
          value={displayedPlace || query}
          onChangeText={(text) => {
            setQuery(text);
            setDisplayedPlace("");
            fetchSuggestions(text);
          }}
        />
        {/* CLEAR BUTTON */}
        {Boolean(showClearButton && displayedPlace) && (
          <TouchableOpacity onPress={handleClear} style={SearchBarStyle.clearButton}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={SearchBarStyle.suggestionItem}
              onPress={() => handleSuggestionPress(item)}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};


export default SearchBarComponent;