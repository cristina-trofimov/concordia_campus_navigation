import {
  Text,
  StyleSheet,
  View,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import React, { Component } from "react";
import { Image } from "@rneui/base";
import { CalendarEvent } from "../interfaces/CalendraEvent";

interface UpcomingClassItemProps {
  calendarEvent: CalendarEvent;
}

interface ClassItemState {
  currentTime: number;
}

export default class UpcomingClassItem extends Component<
  UpcomingClassItemProps,
  ClassItemState
> {
  private courseIcon = require("../resources/images/book-icon.png");
  private intervalID: NodeJS.Timeout | null = null;

  constructor(props: UpcomingClassItemProps) {
    super(props);
    this.state = {
      currentTime: this.getCurrentTimeInMinutes(),
    };
  }

  componentDidMount(): void {
    this.setState({ currentTime: this.getCurrentTimeInMinutes() });
    this.setItemInterval();
  }

  componentWillUnmount(): void {
    this.clearItemInterval();
  }

  setItemInterval() {
    this.intervalID = setInterval(() => {
      this.setState({ currentTime: this.getCurrentTimeInMinutes() });
    }, 20000);
  }

  clearItemInterval() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
    }
  }

  private convertToMinutes = (time: String): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  private getCurrentTimeInMinutes = (): number => {
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    return nowHours * 60 + nowMinutes;
  };

  private isClassInProgress = (
    startTime: String,
    endTime: String
  ): { statusColor: string; statusText: string } => {
    const startTimeInMinutes = this.convertToMinutes(startTime);
    const endTimeInMinutes = this.convertToMinutes(endTime);
    const nowInMinutes = this.state.currentTime;

    if (nowInMinutes >= startTimeInMinutes && nowInMinutes < endTimeInMinutes) {
      return { statusColor: "#00BF63", statusText: "In progress" };
    } else if (nowInMinutes >= endTimeInMinutes) {
      return { statusColor: "#c1121f", statusText: "Ended" };
    } else {
      return { statusColor: "#FFBD59", statusText: "Upcoming" };
    }
  };

  render() {
    const { title, startTime, endTime, location, description } =
      this.props.calendarEvent;

    const { statusColor, statusText } = this.isClassInProgress(
      startTime,
      endTime
    );

    return (
      <View style={[styles.container]}>
        <View style={[styles.imgBox]}>
          <Image source={this.courseIcon} style={{ width: 30, height: 30 }} />
        </View>
        <View style={[styles.content]}>
          <View style={[styles.courseNameAndStatusContainer]}>
            <Text style={[styles.courseName]}>{title}</Text>
            <View style={[styles.status]}>
              <View
                style={[styles.statusCircle, { backgroundColor: statusColor }]}
              ></View>
              <Text style={[styles.statusText]}>{statusText}</Text>
            </View>
          </View>

          <Text style={[styles.startEndTime]}>
            {`${startTime} - ${endTime}`}
          </Text>
          <Text style={[styles.building]}>{location}</Text>
          <Text>Room {description}</Text>
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
  location: {
    fontSize: 14,
    fontWeight: "400",
  },
});
