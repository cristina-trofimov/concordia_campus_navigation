import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const BottomDrawerStyle = StyleSheet.create({
    container: {
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      width: width,
      position: "absolute",
      bottom: 0,
    },
    dragHandle: {
      width: width,
      alignItems: "center",
      paddingVertical: 10,
    },
    dragIndicator: {
      width: 60,
      height: 5,
      backgroundColor: "#8F8F8F",
      borderRadius: 3,
      marginBottom: 10,
    },
    contentContainer: {
      flex: 1,
      padding: 16,
    },
    listContent: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      backgroundColor:'yellow'
      
    },
    instructionsList: {
      margin:6,
      padding: 16,
      backgroundColor: "red",
      borderRadius: 10,
      textAlign:'left',
      borderColor:"#f0f0f0",
      borderTopWidth:2,
      fontSize: 14,
      lineHeight: 24,
      fontWeight:"500",
      paddingVertical:8,
      flexDirection:'row',
      alignItems:'center'

    },
    iconsBox: {
      marginRight:20,
      justifyContent:'center',
      alignItems:'center',
      borderRadius: 12,
      backgroundColor:"purple"
    }

  });