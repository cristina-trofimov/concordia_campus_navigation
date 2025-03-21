import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView
} from "react-native";
import { useCoords } from "../data/CoordsContext";
import { BottomDrawerStyle } from "../styles/BottomDrawerStyle";
import { MaterialIcons} from "@expo/vector-icons";



  const DirectionsSteps = () => {

    const { routeData: routeCoordinates,isTransit,setIsTransit} = useCoords();
    const [htmlInstructions, setHtmlInstructions] = useState<string[]>([]);

  useEffect(() => {

    if (routeCoordinates && routeCoordinates.length > 0) {
      const instructions = routeCoordinates[0].legs[0].steps.map((step: any) => { return step.html_instructions.replace(/<.*?>/g, '').replace(/(?=Destination)/gi, '. '); });
     
      //Declaring the transit route, they are more precise 
      //let iconsList : string[]=[];
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
    //Set htmlInstruction to the transit one if chosen mode is transit
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
        <View style={BottomDrawerStyle.listContent}>
        <ScrollView>
        {htmlInstructions.length > 0 &&
          htmlInstructions.map((instruction, index) => {
            const instructionsIconsDisplay= instruction.toLowerCase().includes('left')?'turn-left':
                                            instruction.toLowerCase().includes('right')?'turn-right':
                                                null;
          return (
            <View key={index} style={BottomDrawerStyle.instructionsList}>
             <View>
              {instructionsIconsDisplay && (
                <View style={BottomDrawerStyle.iconsBox}>
                  <MaterialIcons
                    name={instructionsIconsDisplay as keyof typeof MaterialIcons.glyphMap}
                    size={30}
                    color="black"
                  />
                </View>
              )}
              </View>
              <View>
              <Text style={[BottomDrawerStyle.listContent]}>
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