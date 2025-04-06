import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const UpcomingClassItemStyle = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height * 0.13,
    width: Dimensions.get("window").width,
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#D9D9D9",
    borderRadius: 20,
  },
  imgBox: {
    justifyContent: "center",
  },
  content: {
    flex: 1,
    flexDirection: "column",
    paddingLeft: 15,
    justifyContent: "center",
  },
  courseNameAndStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusCircle: {
    width: 9,
    height: 9,
    borderRadius: 9,
    marginEnd: 8,
  },
  statusText: {
    fontSize: 15,
    color: "#737373",
  },
  courseName: {
    fontSize: 19,
    fontWeight: "900",
  },
  startEndTime: {
    fontSize: 16,
    fontWeight: "900",
  },
  building: {
    fontSize: 16,
    fontWeight: "900",
    color: "#545454",
  },
});
