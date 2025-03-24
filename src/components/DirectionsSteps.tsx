import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useCoords } from "../data/CoordsContext";
import { DirectionStepsStyle } from "../styles/DirectionsStepsStyle";
import { MaterialIcons } from "@expo/vector-icons";

  const DirectionsSteps = () => {

    const { routeData: routeCoordinates,isTransit} = useCoords();
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

      isTransit ? setHtmlInstructions(detailedInstructions) : setHtmlInstructions(instructions);

    // console.log(htmlInstructions);
    } else {
      setHtmlInstructions([]);
    }
  }, [routeCoordinates]);

  return(
      <View style={ DirectionStepsStyle.container}>
      <ScrollView>
      {htmlInstructions.length > 0 &&
        htmlInstructions.map((instruction, index) => {
          const iconMappings: { [key: string]: string } = {
            destination: 'location-on',
            left: 'turn-left',
            right: 'turn-right',
            walk: 'directions-walk',
            bus: 'directions-bus',
            metro: 'directions-subway',
            subway: 'directions-subway',
            train: 'directions-train',
            merge: 'merge',
            straight: 'straight',
            continue: 'straight',
            northeast: 'turn-slight-right',
            northwest: 'turn-slight-left',
            southeast: 'turn-slight-right',
            southwest: 'turn-slight-left',
            exit: 'arrow-outward',
            wait: 'access-time'
          };

          const lowerCaseInstruction = instruction.toLowerCase();

          const instructionsIconsDisplay = Object.keys(iconMappings).find((key) => lowerCaseInstruction.includes(key))
              ? iconMappings[Object.keys(iconMappings).find((key) => lowerCaseInstruction.includes(key))!]
              : null;
        return (
          <View key={index} style={ DirectionStepsStyle.instructionsList}>
            <View>
              <View style={ DirectionStepsStyle.iconsBox}>
                {instructionsIconsDisplay && (
                  <MaterialIcons
                    name={instructionsIconsDisplay as keyof typeof MaterialIcons.glyphMap}
                    size={30}
                    color="black"
                  />
              )}
              </View>
            </View>
            <View style={DirectionStepsStyle.topBorder}>
              <Text style={DirectionStepsStyle.instructionText}>
                {instruction}
              </Text>
            </View>
          </View>
        );
          
          })}
          </ScrollView>
        </View>
    )
  }

export default DirectionsSteps;
