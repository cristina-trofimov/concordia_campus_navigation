import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import React, { Component } from "react";
import { Image } from "@rneui/base";

interface UpcomingClassItemProps {
  courseName: string;
  startTime: string;
  endTime: string;
  building: string;
  room: string;
  location: string;
}

export default class UpcomingClassItem extends Component<UpcomingClassItemProps> {
  static defaultProps = {
    courseName: "",
    startTime: "",
    endTime: "",
    building: "",
    room: "",
    location: "",
  };

  private convertToMinutes = (time: String): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  private determineStatusColor = (
    startTime: String,
    endTime: String
  ): String => {
    const startTimeInMinutes = this.convertToMinutes(startTime);
    const endTimeInMinutes = this.convertToMinutes(endTime);
    const now = new Date();
    const nowInMinutes = this.convertToMinutes(now.get)

    if (nowInMinutes >= startTimeInMinutes)
  };

  private courseIcon = require("../resources/images/book-icon.png");

  render() {
    const { courseName, startTime, endTime, building, room, location } =
      this.props;

    return (
      <View style={[styles.container]}>
        <View style={[styles.imgBox]}>
          <Image source={this.courseIcon} style={{ width: 30, height: 30 }} />
        </View>
        <View style={[styles.content]}>
          <View style={[styles.courseNameAndStatusContainer]}>
            <Text style={[styles.courseName]}>{courseName}</Text>
            <Text>{this.determineStatusColor("wer", "qwer")}</Text>
            <View style={[styles.status]}>
              <View style={[styles.statusCircle]}></View>
              <Text style={[styles.statusText]}>In progress</Text>
            </View>
          </View>

          <Text style={[styles.startEndTime]}>
            {`${startTime} - ${endTime}`}
          </Text>
          <Text style={[styles.building]}>
            {building} {room}
          </Text>
          <Text
            style={[styles.location]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height * 0.13,
    width: Dimensions.get("window").width * 0.9,
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#D9D9D9",
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
    // backgroundColor: "lightblue",
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
    backgroundColor: "#00BF63",
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
  location: {
    fontSize: 14,
    fontWeight: "400",
  },
});
