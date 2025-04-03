import { StyleSheet } from "react-native";

export const SearchBarStyle = StyleSheet.create({
    container: {
      width: "100%",
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
      backgroundColor: "#f8f8f8",
    },
    clearButton: {
      padding: 5,
    },
    suggestionsContainer: {
      maxHeight: 150,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 4,
      backgroundColor: '#fff',
    },

    suggestionsList: {
      width: '100%',
    },
  });