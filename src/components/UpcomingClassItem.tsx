import { Text, View, Pressable, } from "react-native";
import React, { Component } from "react";
import { Image } from "@rneui/base";
import { CalendarEvent } from "../interfaces/CalendraEvent";
import { UpcomingClassItemStyle } from "../styles/UpcomingClassItemStyle";
import analytics from '@react-native-firebase/analytics';

interface UpcomingClassItemProps {
  calendarEvent: CalendarEvent;
  setInputDestination: (destination: string) => void;
}

interface ClassItemState {
  currentTime: number;
}

export default class UpcomingClassItem extends Component<
  UpcomingClassItemProps,
  ClassItemState
> {
  private readonly courseIcon = require("../resources/images/book-icon.png");
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

  private readonly convertToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  private readonly getCurrentTimeInMinutes = (): number => {
    const now = new Date();
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    return nowHours * 60 + nowMinutes;
  };

  private readonly isClassInProgress = (
    startDateTime: string,
    endDateTime: string,
    startTimeFormatted: string,
    endTimeFormatted: string,
  ): { statusColor: string; statusText: string } => {
    const todayDate = new Date();

    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    const startTimeInMinutes = this.convertToMinutes(startTimeFormatted);
    const endTimeInMinutes = this.convertToMinutes(endTimeFormatted);
    const nowInMinutes = this.state.currentTime;

    if ((todayDate < startDate) || (todayDate == startDate && nowInMinutes < startTimeInMinutes)) {
      return { statusColor: "#FFBD59", statusText: "Upcoming" };
    } else if ((todayDate >= startDate) && (todayDate <= endDate) && (nowInMinutes >= startTimeInMinutes) && (nowInMinutes <= endTimeInMinutes)) {
      return { statusColor: "#00BF63", statusText: "In progress" };
    } else if ((startDate <= todayDate) && (todayDate > endDate || (todayDate == endDate && nowInMinutes > endTimeInMinutes))) {
      return { statusColor: "#c1121f", statusText: "Ended" };
    } else {
      return { statusColor: "#ad33ff", statusText: "Invalid" }
    }
  };


  private convertToHHMM(isoString: string): string {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0'); // Ensure 2-digit format
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure 2-digit format
    return `${hours}:${minutes}`;
  }

  private readonly getBuildingName = (location: string): string => {
    const locationParts = location.split(",");
    return locationParts[0].trim(); // Return the first part of the location string
  };

  private readonly getAdress = (location: string): string => {
    const locationParts = location.split(",");
    return locationParts[1].trim(); // Return the second part of the location string
  }


  render() {
    const { title, startTime, endTime, location, description } = this.props.calendarEvent;
    const { setInputDestination } = this.props;

    const startTimeFormatted = this.convertToHHMM(startTime);
    const endTimeFormatted = this.convertToHHMM(endTime);
    const buildingName = this.getBuildingName(location);

    const { statusColor, statusText } = this.isClassInProgress(startTime, endTime, startTimeFormatted, endTimeFormatted);

    return (
      <Pressable
        onPress={() => {
              if ((globalThis as any).isTesting && (globalThis as any).taskTimer.isStarted()) {
                const elapsedTime = (globalThis as any).taskTimer.stop();
                analytics().logEvent('Task_3_finished', {
                  elapsed_time: elapsedTime/1000,
                  user_id: (globalThis as any).userId,
                });
              }

            setInputDestination(this.getAdress(location))} }


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
            {`${startTimeFormatted} - ${endTimeFormatted}`}
          </Text>
          <Text style={[UpcomingClassItemStyle.building]}>{buildingName}</Text>
          <Text>Room {description}</Text>
        </View>
      </Pressable>
    );
  }
}
