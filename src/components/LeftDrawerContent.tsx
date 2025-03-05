import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const LeftDrawerContent = () => {
  const googleLogin = () => {
    //
  };

  const googleLogout = () => {
    //
  };

  return (
    <View style={styles.container} >
      <TouchableOpacity style={styles.button} onPress={googleLogin} >
        <Text style={{ color: "#FFFFFF", fontWeight: "bold", margin: 5, }} >
          <Image
            source={require("../resources/images/icons8-google-white.png")}
            style={styles.image}
          />
          Login with Google
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={googleLogin /** Need to change this */} >
        <Text style={{ fontWeight: "bold" }} >
          <Image
            source={require("../resources/images/icons8-heart.png")}
            style={styles.image}
          />
          Your Favorites
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
    padding: 10,
  },
  button: {
    height: 40,
    width: 200,
    backgroundColor: "#912338",
    borderRadius: 5,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    // flexDirection: "row",
    // flexWrap: "wrap",
    // justifyContent: "space-between",
    // gap: 5,
  },
  image: {
    height: 20,
    width: 20,
    margin: 5,
  },
});

export default LeftDrawerContent;
