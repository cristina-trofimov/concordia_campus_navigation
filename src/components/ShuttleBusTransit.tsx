import React, { useEffect } from "react";
import {
  shuttleSchedule,
  sgwBuildings,
  loyBuildings,
} from "../data/ShuttleBusSchedule";

// Define types
type CampusBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

interface ShuttleBusTransitProps {
  startLocation: any; // Origin coordinates
  endLocation: any; // Destination coordinates
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
  limit: number = 3
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

const ShuttleBusTransit: React.FC<ShuttleBusTransitProps> = ({
  startLocation,
  endLocation,
}) => {
  useEffect(() => {
    // Check if coordinates are within campus bounds
    const startCampus = determineCampusFromCoords(startLocation);
    const endCampus = determineCampusFromCoords(endLocation);

    console.log(
      `Origin campus: ${startCampus}, Destination campus: ${endCampus}`
    );

    if (
      startCampus !== "UNKNOWN" &&
      endCampus !== "UNKNOWN" &&
      startCampus !== endCampus
    ) {
      console.log("Shuttle bus is available between these campuses!");

      // Get next departures
      const nextDepartures = getNextShuttleDepartures(startCampus, endCampus);
      
      if (nextDepartures.length > 0) {
        console.log(`Next departures from ${startCampus} to ${endCampus}:`);
        nextDepartures.forEach((departure, index) => {
          console.log(`${index + 1}. Departs: ${departure.departureTime}, Arrives: ${departure.arrivalTime}`);
        });
      } else {
        console.log(`No more departures from ${startCampus} to ${endCampus} today`);
      }
      
      // Include information about the shuttle stop locations
      console.log(`Shuttle stop at ${startCampus}: ${shuttleSchedule.locations[startCampus].station}`);
      console.log(`Shuttle stop at ${endCampus}: ${shuttleSchedule.locations[endCampus].station}`);
    } else {
      console.log("Shuttle bus is not available for this route");
      if (startCampus === "UNKNOWN") {
        console.log("Origin is not on a recognized campus");
      }
      if (endCampus === "UNKNOWN") {
        console.log("Destination is not on a recognized campus");
      }
      if (startCampus === endCampus && startCampus !== "UNKNOWN") {
        console.log(`Both locations are on the same campus (${startCampus})`);
      }
    }
  }, [startLocation, endLocation]);

  // This component doesn't render anything visible
  return null;
};

export default ShuttleBusTransit;
