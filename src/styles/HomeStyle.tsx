import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const HomeStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
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
  iconsBox: {
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "purple",
  },
  topViewSearchBars: {
    position: 'absolute',
    top: 10,
    backgroundColor: "white",
    width: width * 0.95,
    height: 150,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    elevation: 15,
    zIndex: 1,
  },
});
