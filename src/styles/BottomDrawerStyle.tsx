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
    flex: 1,
    padding: 5,
     alignItems: "flex-end",
     justifyContent: "center",
  },
  instructionsList: {
    margin: 6,
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    textAlign: "left",
    borderColor: "#f0f0f0",
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "500",
    
  },
});
