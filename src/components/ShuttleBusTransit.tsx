import React, { useEffect, useState } from 'react';
import { shuttleSchedule, sgwBuildings, loyBuildings } from '../data/ShuttleBusSchedule';
import { ShuttleResult } from '../interfaces/ShuttleBusSchedule';

interface ShuttleBusTransitProps {
  startLocation: string; // Building code or current location
  endLocation: string;   // Building code (destination)
}

const ShuttleBusTransit: React.FC<ShuttleBusTransitProps> = ({ 
  startLocation, 
  endLocation 
}) => {
  const [isShuttleAvailable, setIsShuttleAvailable] = useState<boolean>(false);
  const [nextDepartures, setNextDepartures] = useState<ShuttleResult[]>([]);

  useEffect(() => {
    // Check if both locations are provided
    if (!startLocation || !endLocation) {
      console.log('Shuttle Bus: Missing locations');
      setIsShuttleAvailable(false);
      return;
    }

    // Function to determine which campus a building belongs to
    const getCampusForBuilding = (buildingCode: string): 'SGW' | 'LOY' | 'UNKNOWN' => {
      if (sgwBuildings.includes(buildingCode)) return 'SGW';
      if (loyBuildings.includes(buildingCode)) return 'LOY';
      return 'UNKNOWN';
    };

    // Get campuses for start and end locations
    const startCampus = getCampusForBuilding(startLocation);
    const endCampus = getCampusForBuilding(endLocation);

    // Check if shuttle is an option (buildings on different campuses)
    const isOptionAvailable = (
      startCampus !== 'UNKNOWN' && 
      endCampus !== 'UNKNOWN' && 
      startCampus !== endCampus
    );

    // Set availability state
    setIsShuttleAvailable(isOptionAvailable);

    // Log the result
    if (isOptionAvailable) {
      console.log(`Shuttle Bus: Available between ${startCampus} and ${endCampus}`);
      
      // Get current time to check schedule
      const currentTime = new Date();
      const dayOfWeek = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Check if service is available today
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log('Shuttle Bus: No service available on weekends');
      } else {
        // Determine which schedule to use
        const scheduleKey = dayOfWeek >= 1 && dayOfWeek <= 4 ? 'monday-thursday' : 'friday';
        const directionKey = `${startCampus}_to_${endCampus}`;
        
        console.log(`Shuttle Bus: Using ${scheduleKey} schedule, direction ${directionKey}`);
        
        // Log the first departure time as an example
        if (directionKey === 'SGW_to_LOY' || directionKey === 'LOY_to_SGW') {
          // Type assertion to please TypeScript 
          const schedule = shuttleSchedule.schedule[scheduleKey][directionKey as 'SGW_to_LOY' | 'LOY_to_SGW'];
          if (schedule && schedule.length > 0) {
            console.log(`Shuttle Bus: First departure at ${schedule[0].departureTime}`);
          }
        }
      }
    } else {
      console.log('Shuttle Bus: Not available for these locations');
      if (startCampus === 'UNKNOWN') {
        console.log(`Shuttle Bus: Start location ${startLocation} not recognized as a campus building`);
      }
      if (endCampus === 'UNKNOWN') {
        console.log(`Shuttle Bus: End location ${endLocation} not recognized as a campus building`);
      }
      if (startCampus !== 'UNKNOWN' && endCampus !== 'UNKNOWN' && startCampus === endCampus) {
        console.log(`Shuttle Bus: Both buildings are on the same campus (${startCampus})`);
      }
    }
  }, [startLocation, endLocation]);

  // For now, this component doesn't render anything visible
  // It just checks availability and logs the result
  return null;
};

export default ShuttleBusTransit;