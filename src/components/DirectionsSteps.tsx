import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView
} from "react-native";
import { useCoords } from "../data/CoordsContext";
import { BottomDrawerStyle } from "../styles/BottomDrawerStyle";
import { DirectionStepsStyle } from "../styles/DirectionsStepsStyle";
import { MaterialIcons} from "@expo/vector-icons";


  const DirectionsSteps = () => {

    const { routeData: routeCoordinates,isTransit,setIsTransit} = useCoords();
    const [htmlInstructions, setHtmlInstructions] = useState<string[]>([]);

  useEffect(() => {

    if (routeCoordinates && routeCoordinates.length > 0) {
      const instructions = routeCoordinates[0].legs[0].steps.map((step: any) => { return step.html_instructions.replace(/<.*?>/g, '').replace(/(?=Destination)/gi, '. '); });
     
      let detailedInstructions: string[]=[];
      const number = routeCoordinates[0].legs[0].steps.length;
      const instructionsGeneral = routeCoordinates[0].legs[0].steps.map((step: any) => { return step.html_instructions.replace(/<.*?>/g, ''); });
      for (let i=0; i<number; i++){
        const detailedHtmlInstructions = routeCoordinates[0]?.legs[0]?.steps[i]?.steps?.map((step: any) => {
          return step.html_instructions.replace(/<.*?>/g, '').replace(/(?=Destination)/gi, '. '); });
          if (detailedHtmlInstructions==undefined){
              detailedInstructions= detailedInstructions.concat(instructionsGeneral[i]);
          }else {
          detailedInstructions=detailedInstructions.concat(instructionsGeneral[i]);
          detailedInstructions=detailedInstructions.concat(detailedHtmlInstructions);}
      }

    if (isTransit==true){
      setHtmlInstructions(detailedInstructions);
    } else {
      setHtmlInstructions(instructions);
    }
    console.log(htmlInstructions);
    } else {
      setHtmlInstructions([]);
    }
  }, [routeCoordinates]);
    return(
        <View style={ DirectionStepsStyle.container}>
        <ScrollView>
        {htmlInstructions.length > 0 &&
          htmlInstructions.map((instruction, index) => {
            const instructionsIconsDisplay=                                            
                                            instruction.toLowerCase().includes('destination')?'location-on':
                                            instruction.toLowerCase().includes('left')?'turn-left':
                                            instruction.toLowerCase().includes('left')?'turn-left':
                                            instruction.toLowerCase().includes('right')?'turn-right':
                                            instruction.toLowerCase().includes('walk')?'directions-walk':
                                            instruction.toLowerCase().includes('bus')?'directions-bus':
                                            instruction.toLowerCase().includes('metro')?'directions-subway':
                                            instruction.toLowerCase().includes('subway')?'directions-subway':
                                            instruction.toLowerCase().includes('train')?'directions-train':
                                            instruction.toLowerCase().includes('merge')?'merge':
                                            instruction.toLowerCase().includes('straight')?'straight':
                                            instruction.toLowerCase().includes('continue')?'straight':
                                            instruction.toLowerCase().includes('northeast')?'turn-slight-right':
                                            instruction.toLowerCase().includes('northwest')?'turn-slight-left':
                                            instruction.toLowerCase().includes('southeast')?'turn-slight-right':
                                            instruction.toLowerCase().includes('southwest')?'turn-slight-left':
                                            instruction.toLowerCase().includes('exit')?'arrow-outward':
                                            instruction.toLowerCase().includes('wait')?'access-time':
                                                null;
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