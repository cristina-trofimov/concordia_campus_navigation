import { Position } from 'geojson';

// Starting points types
export enum EntryPointType {
  ELEVATOR = 'elevator',
  ESCALATOR = 'escalator',
  STAIRS = 'stairs',
  ANY = 'any' // Default - will try all types
}

// Define types for our graph
export interface GraphNode {
  id: string;
  position: Position; // [longitude, latitude]
  neighbors: string[];
  isEntryPoint?: boolean;
  entryPointType?: EntryPointType;
  isRoom?: boolean;
  roomNumber?: string;
  isCorridor?: boolean;
}

export interface Graph {
  nodes: { [id: string]: GraphNode };
}