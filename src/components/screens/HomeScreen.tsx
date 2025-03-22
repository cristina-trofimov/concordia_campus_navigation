import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, ScrollView, View } from "react-native";
import BottomDrawer from "../BottomDrawer";
import { CoordsProvider, useCoords } from "../../data/CoordsContext";
import { IndoorsProvider } from "../../data/IndoorContext";
import LeftDrawer from "../LeftDrawer";
import CalendarButton from "../CalendarButton";
import { HomeStyle } from "../../styles/HomeStyle";
import { FloorSelector } from "../FloorSelector";
import SearchBars from "../SearchBars";
import DirectionsSteps from "../DirectionsSteps";
import { Text } from "react-native-elements";
import MapComponent from "../MapComponent";

const { height } = Dimensions.get("window");


export default function HomeScreen() {
  const drawerHeight = useRef(new Animated.Value(height * 0.5)).current;

  const { routeData: routeCoordinates, isTransit } = useCoords();
  const [htmlInstructions, setHtmlInstructions] = useState<string[]>([]);
  const [inputDestination, setInputDestination] = useState<string>("");


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
      if (isTransit) {
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
      <IndoorsProvider>
        <View style={HomeStyle.container}>
          <CalendarButton />
          <LeftDrawer />
          <MapComponent drawerHeight={drawerHeight} setInputDestination={setInputDestination} />
          <FloorSelector />

          <BottomDrawer drawerHeight={drawerHeight} >
            <SearchBars inputDestination={inputDestination} />
            {/* oviya component  */}
            <View style={HomeStyle.listContent}>
              <ScrollView>
                {htmlInstructions.length > 0 &&
                  htmlInstructions.map((instruction, index) => (
                    <Text key={index} style={HomeStyle.instructionsList}>
                      {instruction}
                    </Text>
                  ))}
              </ScrollView>
            </View>
          </BottomDrawer>

        </View>
      </IndoorsProvider>
    </CoordsProvider>
  );
}
 