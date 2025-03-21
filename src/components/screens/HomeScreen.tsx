import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, View } from "react-native";
import { createTheme } from "@rneui/themed";
import Map from "../Map";
import BottomDrawer from "../BottomDrawer";
import { CoordsProvider, useCoords } from "../../data/CoordsContext";
import LeftDrawer from "../LeftDrawer";
import CalendarButton from "../CalendarButton";
import { HomeStyle } from "../../styles/HomeStyle";
import SearchBars from "../SearchBars";
import DirectionsSteps from "../DirectionsSteps";
import { Text } from "react-native-elements";

const { height } = Dimensions.get("window");

const theme = createTheme({
  lightColors: {
    primary: '#912338',
    secondary: '#D15329',
  },

  mode: "light",
});

export default function HomeScreen() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;

  const { routeData: routeCoordinates, isTransit, setIsTransit } = useCoords();
  const [htmlInstructions, setHtmlInstructions] = useState<string[]>([]);


  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const instructions = routeCoordinates[0].legs[0].steps.map(
        (step: any) => {
          return step.html_instructions
            .replace(/<[^<>]*>/g, "")
            .replace(/(?=Destination)/gi, ". ");
        }
      );

      let detailedInstructions: string[] = [];
      const number = routeCoordinates[0].legs[0].steps.length;
      const instructionsGeneral = routeCoordinates[0].legs[0].steps.map(
        (step: any) => {
          return step.html_instructions.replace(/<[^<>]*>/g, "");
        }
      );
      for (let i = 0; i < number; i++) {
        const detailedHtmlInstructions = routeCoordinates[0]?.legs[0]?.steps[
          i
        ]?.steps?.map((step: any) => {
          return step.html_instructions
            .replace(/<[^<>]*>/g, "")
            .replace(/(?=Destination)/gi, ". ");
        });
        if (detailedHtmlInstructions == undefined) {
          detailedInstructions = detailedInstructions.concat(
            instructionsGeneral[i]
          );
        } else {
          detailedInstructions = detailedInstructions.concat(
            instructionsGeneral[i]
          );
          detailedInstructions = detailedInstructions.concat(
            detailedHtmlInstructions
          );
        }
      }
      if (isTransit == true) {
        setHtmlInstructions(detailedInstructions);
      } else {
        setHtmlInstructions(instructions);
      }
      console.log(htmlInstructions);
    } else {
      setHtmlInstructions([]);
    }
  }, [routeCoordinates]);



  return (
    <CoordsProvider>
      <View style={HomeStyle.container}>
        <CalendarButton />
        <LeftDrawer />
        <Map drawerHeight={drawerHeight} />
        <BottomDrawer drawerHeight={drawerHeight} >
          <SearchBars />
          <DirectionsSteps/>
          {/* oviya component  */}
          

        </BottomDrawer>
      </View>
    </CoordsProvider>
  );
}
 