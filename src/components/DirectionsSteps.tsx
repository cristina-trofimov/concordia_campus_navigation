import React, { useEffect, useState } from "react";
import { View, Text, } from "react-native";
import { useCoords } from "../data/CoordsContext";
import { DirectionStepsStyle } from "../styles/DirectionsStepsStyle";
import { MaterialIcons } from "@expo/vector-icons";
import getIndoorDirectionText from "./indoorinstructions";
import { useIndoor } from "../data/IndoorContext";

const DirectionsSteps = () => {
  const { routeData: routeCoordinates, isTransit } = useCoords();
  const { originRoom, destinationRoom, indoorTransport } = useIndoor();
  const [htmlInstructions, setHtmlInstructions] = useState<string[]>([]);



  const [firstMessage, setFirstMessage] = useState("");
  const [secondMessage, setSecondMessage] = useState("");
  const [sameBuilding, setSameBuilding] = useState(false);

  const formatSteps = (step: any): any => {
    if (!step?.html_instructions) {
      return 'Continue';
    }
    return step.html_instructions
      .replace(/<[^<>]*>/g, "")
      .replace(/(?=Destination)/gi, ". ");
  };


  useEffect(() => {
    const [first, second] = getIndoorDirectionText(originRoom, destinationRoom, indoorTransport);
    setFirstMessage(first);
    setSecondMessage(second);
    if (originRoom && destinationRoom && (originRoom?.building == destinationRoom?.building)) {
      setSameBuilding(true);
    } else {
      setSameBuilding(false);
    }
  }, [originRoom, destinationRoom, indoorTransport]);


  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      // First filter out any steps marked with our special prefix
      const filteredSteps = routeCoordinates[0].legs[0].steps.filter(
        (step: { html_instructions: string | string[]; }) =>
          step.html_instructions && !step.html_instructions.includes("HIDDEN_STEP_DO_NOT_DISPLAY")
      );

      const instructions = routeCoordinates[0].legs[0].steps.map((step: any) =>
        formatSteps(step)
      );

      let detailedInstructions: string[] = [];
      const number = filteredSteps.length;
      const instructionsGeneral = filteredSteps.map(
        (step: any) => {
          if (step.travel_mode === "TRANSIT" && (step.transit_details.line?.vehicle?.name == 'Bus')) {
            const busNumber = step.transit_details.line?.short_name ?? step.transit_details.line?.name ?? "Bus number not found";
            const busStop = step.transit_details.arrival_stop?.name ?? "Bus stop found";
            return step.html_instructions.replace(/<[^<>]*>/g, "") + `. Take Bus ${busNumber}. Get off at stop ${busStop}.`;
          }
          if (step.travel_mode === "TRANSIT" && (step.transit_details.line?.vehicle?.name == 'Subway')) {
            const metroStop = step.transit_details.arrival_stop?.name ?? "Metro stop not found";
            return step.html_instructions.replace(/<[^<>]*>/g, "") + `. Get off at stop ${metroStop}.`;
          }
          return step.html_instructions.replace(/<[^<>]*>/g, "");
        }
      );

      for (let i = 0; i < number; i++) {
        const detailedHtmlInstructions = filteredSteps[i]?.steps?.map(
          (step: any) => formatSteps(step)
        );

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

      isTransit
        ? setHtmlInstructions(detailedInstructions)
        : setHtmlInstructions(instructions);

    } else {
      setHtmlInstructions([]);
    }
  }, [routeCoordinates]);

  return (
    <View style={DirectionStepsStyle.container}>
      {/* First message at the top */}
      {(firstMessage !== "" && htmlInstructions.length > 0) && (
        <View style={DirectionStepsStyle.instructionsList}>
          <View>
            <View style={DirectionStepsStyle.iconsBox}>
              <MaterialIcons name="location-on" size={30} color="black" />
            </View>
          </View>
          <View style={DirectionStepsStyle.topBorder}>
            <Text style={DirectionStepsStyle.instructionText}>
              {firstMessage}
            </Text>
          </View>
        </View>
      )}

      {/* Instruction List */}
      {htmlInstructions.length > 0 && !sameBuilding &&
        htmlInstructions.map((instruction, index) => {
          const iconMappings: { [key: string]: string } = {
            destination: "location-on",
            left: "turn-left",
            right: "turn-right",
            walk: "directions-walk",
            bus: "directions-bus",
            metro: "directions-subway",
            subway: "directions-subway",
            train: "directions-train",
            merge: "merge",
            straight: "straight",
            continue: "straight",
            northeast: "turn-slight-right",
            northwest: "turn-slight-left",
            southeast: "turn-slight-right",
            southwest: "turn-slight-left",
            exit: "arrow-outward",
            wait: "access-time",
          };

          const lowerCaseInstruction = instruction.toLowerCase();
          const instructionsIconsDisplay = Object.keys(iconMappings).find((key) =>
            lowerCaseInstruction.includes(key)
          )
            ? iconMappings[
            Object.keys(iconMappings).find((key) =>
              lowerCaseInstruction.includes(key)
            )!
            ]
            : null;

          return (
            <View key={index} style={DirectionStepsStyle.instructionsList}>
              <View>
                <View style={DirectionStepsStyle.iconsBox}>
                  {instructionsIconsDisplay && (
                    <MaterialIcons
                      name={
                        instructionsIconsDisplay as keyof typeof MaterialIcons.glyphMap
                      }
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

      {/* Second message at the bottom */}
      {(secondMessage !== "" && htmlInstructions.length > 0) && (
        <View style={DirectionStepsStyle.instructionsList}>
          <View>
            <View style={DirectionStepsStyle.iconsBox}>
              <MaterialIcons name="location-on" size={30} color="black" />
            </View>
          </View>
          <View style={DirectionStepsStyle.topBorder}>
            <Text style={DirectionStepsStyle.instructionText}>
              {secondMessage}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

};

export default DirectionsSteps;