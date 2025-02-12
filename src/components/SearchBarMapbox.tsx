import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MAPBOX_ACCESS_TOKEN = "sk.eyJ1IjoibWlkZHkiLCJhIjoiY202c2ZqdW03MDhjMzJxcTUybTZ6d3k3cyJ9.xPp9kFl0VC1SDnlp_ln2qA"; 

const SearchBarMapbox = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json`,
        {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN,
            autocomplete: true,
            country: "CA", // Change based on your region
            types: "address",
          },
        }
      );
      setSuggestions(response.data.features);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Centered Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Find your way around campus</Text>
      </View>

      {/* Search Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Where to?"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            fetchSuggestions(text);
          }}
        />
      </View>

      {/* Suggestions List */}
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => {
              setQuery(item.place_name);
              setSuggestions([]); // Hide suggestions on selection
            }}
          >
            <Text>{item.place_name}</Text>
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
    titleContainer: {
        alignItems: 'center', // Center the title horizontally
        marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 8,
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
  

export default SearchBarMapbox;