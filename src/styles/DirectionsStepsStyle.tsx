import { StyleSheet } from "react-native";

export const DirectionStepsStyle = StyleSheet.create({

  container: {
    flexDirection: 'column',
    flex: 1,
  },
  instructionsList: {
    margin: 6,
    borderRadius: 10,
    textAlign: "left",
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "500",
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'flex-end',
  },
  iconsBox: {
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    width: 50,
    height: 50,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 500,
    paddingVertical: 8,
    paddingRight: 10,
    textAlignVertical: 'center'
  },
  topBorder: {
    flex: 1,
    borderTopColor: "#f0f0f0",
    borderTopWidth: 2,
    justifyContent: 'center'
  }
});