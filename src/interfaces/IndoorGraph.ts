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
  position: Position;
  neighbors: string[];
  isCorridor?: boolean;
  isRoom?: boolean;
  isEntryPoint?: boolean;
  isEdgeNode?: boolean; 
  roomNumber?: string;
  entryPointType?: EntryPointType;
}

export interface Graph {
  [x: string]: any;
  nodes: { [id: string]: GraphNode };
}