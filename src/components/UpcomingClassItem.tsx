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
import { UpcomingClassItemStyle } from "../styles/UpcomingClassItemStyle";
import { Pressable } from "react-native";

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
      <Pressable
        onPress={() => console.log(`Clicked on: ${title}`)}
        disabled={statusText === "Ended"} // Disable if class has ended
        style={({ pressed }) => [
          UpcomingClassItemStyle.container,
          {
            backgroundColor: pressed ? "rgba(0, 0, 0, 0.2)" : "white",

            opacity: statusText === "Ended" ? 0.5 : 1, // Make it look visually disabled
          },
        ]}
      >
        <View style={[UpcomingClassItemStyle.imgBox]}>
          <Image source={this.courseIcon} style={{ width: 30, height: 30 }} />
        </View>
        <View style={[UpcomingClassItemStyle.content]}>
          <View style={[UpcomingClassItemStyle.courseNameAndStatusContainer]}>
            <Text
              style={[
                UpcomingClassItemStyle.courseName,
                statusText === "Ended" && {
                  textDecorationLine: "line-through",
                },
              ]}
            >
              {title}
            </Text>
            <View style={[UpcomingClassItemStyle.status]}>
              <View
                style={[
                  UpcomingClassItemStyle.statusCircle,
                  { backgroundColor: statusColor },
                ]}
              ></View>
              <Text style={[UpcomingClassItemStyle.statusText]}>
                {statusText}
              </Text>
            </View>
          </View>

          <Text style={[UpcomingClassItemStyle.startEndTime]}>
            {`${startTime} - ${endTime}`}
          </Text>
          <Text style={[UpcomingClassItemStyle.building]}>{location}</Text>
          <Text>Room {description}</Text>
        </View>
      </Pressable>
    );
  }
}
