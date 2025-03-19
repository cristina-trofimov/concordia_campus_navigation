import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  View,
  PanResponder,
  Animated,
  PanResponderGestureState,
  Text,
  TouchableOpacity,
  ScrollView
} from "react-native";
import SearchBars from "./SearchBars";
import { useCoords } from "../data/CoordsContext";
import { BottomDrawerStyle } from "../styles/BottomDrawerStyle";
import { SearchBar } from "react-native-elements";

const { height, width } = Dimensions.get("window");
const COLLAPSED_HEIGHT = height * 0.1;
const EXPANDED_HEIGHT = height * 0.5;
const MAX_HEIGHT = height * 0.8;
const VELOCITY_THRESHOLD = 0.5;


function BottomDrawer({
  children,
  drawerHeight,
}: {
  children: Readonly<ReactNode>;
  drawerHeight: Readonly<Animated.Value>;
}) {
  const { routeData: routeCoordinates,isTransit,setIsTransit} = useCoords();
  const [htmlInstructions, setHtmlInstructions] = useState<string[]>([]);

  useEffect(() => {


    if (routeCoordinates && routeCoordinates.length > 0) {
      const instructions = routeCoordinates[0].legs[0].steps.map((step: any) => { return step.html_instructions.replace(/<.*?>/g, '').replace(/(?=Destination)/gi, '. '); });
     
      //Declaring the transit route, they are more precise 
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

  const isExpanded = useRef<boolean>(true);



  const animateToPosition = (expanded: boolean) => {
    isExpanded.current = expanded;
    const targetHeight = expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
    Animated.spring(drawerHeight, {
      toValue: targetHeight,
      tension: 40,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handlePanResponderMove = (_: any, gesture: PanResponderGestureState) => {
    const newHeight = Math.max(
      COLLAPSED_HEIGHT,
      Math.min(
        EXPANDED_HEIGHT,
        isExpanded.current
          ? EXPANDED_HEIGHT - gesture.dy
          : COLLAPSED_HEIGHT - gesture.dy
      )
    );
    drawerHeight.setValue(newHeight);
  };

  const handlePanResponderRelease = (_: any, gesture: PanResponderGestureState) => {
    const shouldExpand = gesture.vy < 0 || (isExpanded.current && gesture.dy < 0);
    animateToPosition(shouldExpand);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
    })
  ).current;

  return (
    <Animated.View style={[BottomDrawerStyle.container, { height: drawerHeight }]}>
      <View {...panResponder.panHandlers} style={BottomDrawerStyle.dragHandle}>
        <View style={BottomDrawerStyle.dragIndicator} />
        <SearchBars />
        <View style={BottomDrawerStyle.listContent}>
        <ScrollView>
        {htmlInstructions.length > 0 &&
          htmlInstructions.map((instruction, index) => (
            <Text key={index} style={BottomDrawerStyle.instructionsList}>
              {instruction}
            </Text>
          ))}
           </ScrollView>
          </View>
      </View>
      <View style={BottomDrawerStyle.contentContainer}>{children}</View>
    </Animated.View>
  );
}



export default BottomDrawer;
