import React, { useEffect } from 'react';

// Define types
type CampusBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

interface ShuttleBusTransitProps {
  startLocation: any; // Origin coordinates
  endLocation: any;   // Destination coordinates
}

// Define campus boundaries
const SGW_CAMPUS_BOUNDS: CampusBounds = {
  north: 45.497500,
  south: 45.493300,
  east: -73.574000,
  west: -73.582000
};

const LOY_CAMPUS_BOUNDS: CampusBounds = {
  north: 45.460000,
  south: 45.455000,
  east: -73.635000,
  west: -73.642000
};

// Helper function to check if coordinates are within campus bounds
const isInCampusBounds = (lat: number, lng: number, campusBounds: CampusBounds): boolean => {
  return (
    lat <= campusBounds.north && 
    lat >= campusBounds.south && 
    lng <= campusBounds.east && 
    lng >= campusBounds.west
  );
};

// Function to determine campus from coordinates
const determineCampusFromCoords = (coords: any): 'SGW' | 'LOY' | 'UNKNOWN' => {
  if (!coords) return 'UNKNOWN';
  
  let lat, lng;
  
  // Handle string coordinates like "45.49706,-73.5788017"
  if (typeof coords === 'string' && coords.includes(',')) {
    [lat, lng] = coords.split(',').map(c => parseFloat(c.trim()));
  } 
  // Handle object coordinates like {latitude: 45.495413, longitude: -73.577693}
  else if (coords.latitude && coords.longitude) {
    lat = coords.latitude;
    lng = coords.longitude;
  }
  // If we couldn't extract coordinates
  else {
    return 'UNKNOWN';
  }
  
  if (isInCampusBounds(lat, lng, SGW_CAMPUS_BOUNDS)) {
    return 'SGW';
  } else if (isInCampusBounds(lat, lng, LOY_CAMPUS_BOUNDS)) {
    return 'LOY';
  }
  
  return 'UNKNOWN';
};

const ShuttleBusTransit: React.FC<ShuttleBusTransitProps> = ({ 
  startLocation, 
  endLocation 
}) => {
  useEffect(() => {
    // Check if coordinates are within campus bounds
    const startCampus = determineCampusFromCoords(startLocation);
    const endCampus = determineCampusFromCoords(endLocation);
    
    console.log(`Origin campus: ${startCampus}, Destination campus: ${endCampus}`);
    
    if (startCampus !== 'UNKNOWN' && endCampus !== 'UNKNOWN' && startCampus !== endCampus) {
      console.log("Shuttle bus is available between these campuses!");
    } else {
      console.log("Shuttle bus is not available for this route");
      if (startCampus === 'UNKNOWN') {
        console.log("Origin is not on a recognized campus");
      }
      if (endCampus === 'UNKNOWN') {
        console.log("Destination is not on a recognized campus");
      }
      if (startCampus === endCampus && startCampus !== 'UNKNOWN') {
        console.log(`Both locations are on the same campus (${startCampus})`);
      }
    }
  }, [startLocation, endLocation]);

  // This component doesn't render anything visible
  return null;
};

export default ShuttleBusTransit;