import React, { useEffect, useState } from "react";
import {
  shuttleSchedule,
  sgwBuildings,
  loyBuildings,
} from "../data/ShuttleBusSchedule";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { ShuttleBusTransitStyle } from "../styles/ShuttleBusTransitStyle";

// Define types
type CampusBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

interface ShuttleBusTransitProps {
  startLocation: any;
  endLocation: any;
  onSelect?: (shuttleInfo: {
    startCampus: "SGW" | "LOY";
    endCampus: "SGW" | "LOY";
    startCampusName: string;
    endCampusName: string;
    nextDepartureTime: string;
    shuttleStation: string;
  }) => void;
}

// Define campus boundaries
const SGW_CAMPUS_BOUNDS: CampusBounds = {
  north: 45.4975,
  south: 45.4933,
  east: -73.574,
  west: -73.582,
};

const LOY_CAMPUS_BOUNDS: CampusBounds = {
  north: 45.46,
  south: 45.455,
  east: -73.635,
  west: -73.642,
};

// Helper function to check if coordinates are within campus bounds
const isInCampusBounds = (
  lat: number,
  lng: number,
  campusBounds: CampusBounds
): boolean => {
  return (
    lat <= campusBounds.north &&
    lat >= campusBounds.south &&
    lng <= campusBounds.east &&
    lng >= campusBounds.west
  );
};

// Function to determine campus from coordinates
const determineCampusFromCoords = (coords: any): "SGW" | "LOY" | "UNKNOWN" => {
  if (!coords) return "UNKNOWN";

  let lat, lng;

  // Handle string coordinates like "45.49706,-73.5788017"
  if (typeof coords === "string" && coords.includes(",")) {
    [lat, lng] = coords.split(",").map((c) => parseFloat(c.trim()));
  }
  // Handle object coordinates like {latitude: 45.495413, longitude: -73.577693}
  else if (coords.latitude && coords.longitude) {
    lat = coords.latitude;
    lng = coords.longitude;
  }
  // If we couldn't extract coordinates
  else {
    return "UNKNOWN";
  }

  if (isInCampusBounds(lat, lng, SGW_CAMPUS_BOUNDS)) {
    return "SGW";
  } else if (isInCampusBounds(lat, lng, LOY_CAMPUS_BOUNDS)) {
    return "LOY";
  }

  return "UNKNOWN";
};

// Function to get the next shuttle departures
const getNextShuttleDepartures = (
  startCampus: "SGW" | "LOY",
  endCampus: "SGW" | "LOY",
  limit: number = 2
): Array<{ departureTime: string; arrivalTime: string }> => {
  // Get current date and time
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Determine which schedule to use
  let scheduleKey: "monday-thursday" | "friday" | "weekend";
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    // Monday to Thursday
    scheduleKey = "monday-thursday";
  } else if (dayOfWeek === 5) {
    // Friday
    scheduleKey = "friday";
  } else {
    // Weekend (Saturday or Sunday)
    console.log("No shuttle service available on weekends");
    return [];
  }

  // Get the direction key
  const directionKey = `${startCampus}_to_${endCampus}` as
    | "SGW_to_LOY"
    | "LOY_to_SGW";

  // Get the schedule for today and the direction
  const todaySchedule = shuttleSchedule.schedule[scheduleKey][directionKey];

  if (!todaySchedule) {
    console.log(`No schedule found for ${directionKey} on ${scheduleKey}`);
    return [];
  }

  // Find the next departures
  const nextDepartures = todaySchedule
    .map((shuttle) => {
      const [hours, minutes] = shuttle.departureTime.split(":").map(Number);
      const departureTimeInMinutes = hours * 60 + minutes;

      return {
        ...shuttle,
        departureTimeInMinutes,
        minutesUntilDeparture: departureTimeInMinutes - currentTimeInMinutes,
      };
    })
    .filter((shuttle) => shuttle.minutesUntilDeparture >= 0) // Only future departures
    .sort((a, b) => a.minutesUntilDeparture - b.minutesUntilDeparture)
    .slice(0, limit);

  if (nextDepartures.length === 0) {
    console.log("No more shuttles available today");
    return [];
  }

  return nextDepartures.map((shuttle) => ({
    departureTime: shuttle.departureTime,
    arrivalTime: shuttle.arrivalTime,
  }));
};

// Add this helper function to calculate the adjusted departure time
const calculateAdjustedDepartureTime = (
  departureTime: string,
  startCampus: "SGW" | "LOY",
  endCampus: "SGW" | "LOY"
) => {
  // If walk time is 5 minutes, check if we need to wait for a later shuttle
  const [hours, minutes] = departureTime.split(":").map(Number);
  const departureDate = new Date();
  departureDate.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const walkTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  // If we can make it to the station in time (current time + walk time <= departure time)
  if (now.getTime() + walkTime <= departureDate.getTime()) {
    return departureTime;
  } else {
    // Otherwise, we need the next shuttle after this one
    const departures = getNextShuttleDepartures(startCampus, endCampus, 2);
    if (departures.length > 1) {
      return departures[1].departureTime;
    }
    return departureTime; // Fallback to original time if no next shuttle
  }
};

const ShuttleBusTransit: React.FC<ShuttleBusTransitProps> = ({
  startLocation,
  endLocation,
  onSelect,
}) => {
  const [isShuttleAvailable, setIsShuttleAvailable] = useState(false);
  const [startCampus, setStartCampus] = useState<"SGW" | "LOY" | "UNKNOWN">(
    "UNKNOWN"
  );
  const [endCampus, setEndCampus] = useState<"SGW" | "LOY" | "UNKNOWN">(
    "UNKNOWN"
  );
  const [nextDepartures, setNextDepartures] = useState<
    {
      departureTime: string;
      arrivalTime: string;
    }[]
  >([]);

  useEffect(() => {
    // Check if coordinates are within campus bounds
    const start = determineCampusFromCoords(startLocation);
    const end = determineCampusFromCoords(endLocation);

    setStartCampus(start);
    setEndCampus(end);

    console.log(`Origin campus: ${start}, Destination campus: ${end}`);

    // Check if shuttle is available
    const shuttleAvailable =
      start !== "UNKNOWN" && end !== "UNKNOWN" && start !== end;

    setIsShuttleAvailable(shuttleAvailable);

    // Get next departures if shuttle is available
    if (shuttleAvailable) {
      console.log("Shuttle bus is available between these campuses!");
      const departures = getNextShuttleDepartures(start, end, 2); // Get 3 departures
      if (departures.length > 0) {
        setNextDepartures(departures);
        console.log(`Next departures:`, departures);
      } else {
        setNextDepartures([]);
        console.log("No more departures today");
      }
    } else {
      console.log("Shuttle bus is not available for this route");
    }
  }, [startLocation, endLocation]);

  // If shuttle is not available, don't render anything
  if (!isShuttleAvailable) {
    return null;
  }

  // Get campus names for display
  const startCampusName =
    startCampus === "SGW" ? "Sir George Williams" : "Loyola";
  const endCampusName = endCampus === "SGW" ? "Sir George Williams" : "Loyola";

  return (
    <View style={ShuttleBusTransitStyle.container}>
      <View style={ShuttleBusTransitStyle.infoContainer}>
        <Text style={ShuttleBusTransitStyle.title}>
          Concordia Shuttle Bus Available
        </Text>
        <Text style={ShuttleBusTransitStyle.info}>
          Concordia University provides a free shuttle service between{" "}
          {startCampusName} and {endCampusName} campuses.
        </Text>

        {nextDepartures.length > 0 ? (
          <View>
            <Text style={ShuttleBusTransitStyle.subtitle}>
              Next departures:
            </Text>
            {nextDepartures.map((departure, index) => (
              <Text key={index} style={ShuttleBusTransitStyle.schedule}>
                 {departure.departureTime} (arrives{" "}
                {departure.arrivalTime})
              </Text>
            ))}
          </View>
        ) : (
          <Text style={ShuttleBusTransitStyle.schedule}>
          No more departures available today
          </Text>
        )}

        <Text style={ShuttleBusTransitStyle.stationInfo}>
          Pickup:{" "}
          {startCampus !== "UNKNOWN"
            ? shuttleSchedule.locations[startCampus as "SGW" | "LOY"].station
            : "Location not on campus"}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          ShuttleBusTransitStyle.button,
          nextDepartures.length === 0 && { opacity: 0.5, backgroundColor: '#999' }
        ]}
        onPress={() => {
          if (onSelect && nextDepartures.length > 0) {
            const shuttleStation =
              startCampus === "SGW"
                ? "1455 Maisonneuve Blvd W, Montreal, QC H3G 1M8"
                : "7137 Rue Sherbrooke W, Montréal, QC H4B 1R2";

            // Calculate the actual departure time accounting for 5 min walk
            const adjustedDepartureTime = calculateAdjustedDepartureTime(
              nextDepartures[0].departureTime,
              startCampus as "SGW" | "LOY",
              endCampus as "SGW" | "LOY"
            );

            onSelect({
              startCampus: startCampus as "SGW" | "LOY",
              endCampus: endCampus as "SGW" | "LOY",
              startCampusName: startCampusName,
              endCampusName: endCampusName,
              nextDepartureTime: adjustedDepartureTime,
              shuttleStation: shuttleStation,
            });
          }
        }}
      >
        <Text style={ShuttleBusTransitStyle.buttonText}>
          View Shuttle Bus Route
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShuttleBusTransit;
