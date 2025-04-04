/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HighlightIndoorMap, useIndoorFeatures } from '../src/components/IndoorMap';
import { useCoords } from '../src/data/CoordsContext';
import { useIndoor } from '../src/data/IndoorContext';

// Mock the dependencies
jest.mock('@rnmapbox/maps', () => {
  return {
    ShapeSource: ({ children }) => <div data-testid="mapbox-shape-source">{children}</div>,
    FillLayer: () => <div data-testid="mapbox-fill-layer" />,
    SymbolLayer: () => <div data-testid="mapbox-symbol-layer" />,
    CircleLayer: () => <div data-testid="mapbox-circle-layer" />
  };
});

jest.mock('../src/data/CoordsContext', () => ({
  useCoords: jest.fn()
}));

jest.mock('../src/data/IndoorContext', () => ({
  useIndoor: jest.fn()
}));

// Fix the import path for IndoorPointsOfInterest
jest.mock('../src/components/IndoorPointsOfInterest', () => ({
  IndoorPointsOfInterest: () => <div data-testid="indoor-points-of-interest" />
}));

jest.mock('../src/data/buildingFloorAssociations.ts', () => ({
  buildingFloorAssociations: [
    { buildingID: 'hall', floor: '1', component: 'h1Features' },
    { buildingID: 'hall', floor: '2', component: 'h2Features' }
  ]
}));

// Mock all indoor feature imports
jest.mock('../src/data/indoor/Hall/H1.ts', () => ({
  h1Features: [{ type: 'Feature', properties: { ref: 'H1-101' } }]
}));

jest.mock('../src/data/indoor/Hall/H2.ts', () => ({
  h2Features: [{ type: 'Feature', properties: { ref: 'H2-101' } }]
}));

// Mock the remaining imports (shortened for brevity)
const mockEmptyFeatures = [];
jest.mock('../src/data/indoor/Hall/H8.ts', () => ({ h8Features: mockEmptyFeatures }));
jest.mock('../src/data/indoor/Hall/H9.ts', () => ({ h9Features: mockEmptyFeatures }));
jest.mock('../src/data/indoor/CC/CC1.ts', () => ({ cc1Features: mockEmptyFeatures }));
jest.mock('../src/data/indoor/MB/MB1.ts', () => ({ mb1Features: mockEmptyFeatures }));
jest.mock('../src/data/indoor/MB/MBS2.ts', () => ({ mb2Features: mockEmptyFeatures }));
jest.mock('../src/data/indoor/VE/VE1.ts', () => ({ ve1Features: mockEmptyFeatures }));
jest.mock('../src/data/indoor/VE/VE2.ts', () => ({ ve2Features: mockEmptyFeatures }));
jest.mock('../src/data/indoor/VL/VL1.ts', () => ({ vl1Features: mockEmptyFeatures }));
jest.mock('../src/data/indoor/VL/VL2.ts', () => ({ vl2Features: mockEmptyFeatures }));

describe('HighlightIndoorMap Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock values
    useCoords.mockReturnValue({
      highlightedBuilding: null,
      isInsideBuilding: false,
      destinationCoords: null,
      myLocationCoords: null
    });
    
    useIndoor.mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: false,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: null,
      destinationRoom: null,
      currentFloor: null
    });
  });

  test('should not render Mapbox layers when indoorFeatures is empty', () => {
    render(<HighlightIndoorMap />);
    
    const shapeSource = screen.queryByTestId('mapbox-shape-source');
    expect(shapeSource).not.toBeInTheDocument();
  });

  test('should render Mapbox layers when indoorFeatures exist and inFloorView is true', () => {
    useIndoor.mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: true,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [{ type: 'Feature', properties: { ref: 'H1-101' } }],
      originRoom: null,
      destinationRoom: null,
      currentFloor: null
    });
    
    render(<HighlightIndoorMap />);
    
    const shapeSource = screen.getByTestId('mapbox-shape-source');
    expect(shapeSource).toBeInTheDocument();
    
    const fillLayer = screen.getByTestId('mapbox-fill-layer');
    expect(fillLayer).toBeInTheDocument();
    
    const symbolLayer = screen.getByTestId('mapbox-symbol-layer');
    expect(symbolLayer).toBeInTheDocument();
  });

  test('should render origin room pin when conditions are met', () => {
    useIndoor.mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: true,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: { coordinates: [-73.577142, 45.495753], ref: 'H1-101', floor: '1' },
      destinationRoom: null,
      currentFloor: '1st Floor'
    });
    
    render(<HighlightIndoorMap />);
    
    // We expect shapeSources to be 1 since we're only showing the origin pin
    const shapeSources = screen.getAllByTestId('mapbox-shape-source');
    expect(shapeSources.length).toBe(1);
    
    const circleLayer = screen.getByTestId('mapbox-circle-layer');
    expect(circleLayer).toBeInTheDocument();
  });

  test('should render destination room pin when conditions are met', () => {
    useIndoor.mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: true,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: null,
      destinationRoom: { coordinates: [-73.577142, 45.495753], ref: 'H1-102', floor: '1' },
      currentFloor: '1st Floor'
    });
    
    render(<HighlightIndoorMap />);
    
    const shapeSources = screen.getAllByTestId('mapbox-shape-source');
    expect(shapeSources.length).toBe(1);
    
    const circleLayer = screen.getByTestId('mapbox-circle-layer');
    expect(circleLayer).toBeInTheDocument();
  });

  test('should not show room pins when floor does not match', () => {
    useIndoor.mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: true,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: { coordinates: [-73.577142, 45.495753], ref: 'H1-101', floor: '1' },
      destinationRoom: { coordinates: [-73.577142, 45.495753], ref: 'H2-201', floor: '2' },
      currentFloor: '2nd Floor'
    });
    
    render(<HighlightIndoorMap />);
    
    // Only destination is on 2nd floor, so we should have 1 shape source
    const shapeSources = screen.getAllByTestId('mapbox-shape-source');
    expect(shapeSources.length).toBe(1);
  });

  test('should update floor info when highlightedBuilding changes', () => {
    const setCurrentFloorAssociations = jest.fn();
    
    useCoords.mockReturnValue({
      highlightedBuilding: { properties: { id: 'hall' } },
      isInsideBuilding: false,
      destinationCoords: null,
      myLocationCoords: null
    });
    
    useIndoor.mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView: jest.fn(),
      inFloorView: false,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations,
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: null,
      destinationRoom: null,
      currentFloor: null
    });
    
    render(<HighlightIndoorMap />);
    
    // We need to wait for the useEffect to be called
    expect(setCurrentFloorAssociations).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ buildingID: 'hall' })
      ])
    );
  });

  test('should set inFloorView when destinationCoords exists and isInsideBuilding is true', () => {
    const setInFloorView = jest.fn();
    
    useCoords.mockReturnValue({
      highlightedBuilding: null,
      isInsideBuilding: true,
      destinationCoords: [-73.577142, 45.495753],
      myLocationCoords: [-73.577142, 45.495753]
    });
    
    useIndoor.mockReturnValue({
      setBuildingHasFloors: jest.fn(),
      setInFloorView,
      inFloorView: false,
      setCurrentFloor: jest.fn(),
      setFloorList: jest.fn(),
      currentFloorAssociations: [],
      setCurrentFloorAssociations: jest.fn(),
      setIndoorFeatures: jest.fn(),
      indoorFeatures: [],
      originRoom: null,
      destinationRoom: null,
      currentFloor: null
    });
    
    render(<HighlightIndoorMap />);
    
    expect(setInFloorView).toHaveBeenCalledWith(true);
  });

  test('should render IndoorPointsOfInterest component', () => {
    // Mock implementation for IndoorPointsOfInterest
    render(<HighlightIndoorMap />);
    
    const pointsOfInterest = screen.getByTestId('indoor-points-of-interest');
    expect(pointsOfInterest).toBeInTheDocument();
  });
});

describe('useIndoorFeatures Hook', () => {
  test('should select indoor features correctly', () => {
    const setIndoorFeatures = jest.fn();
    const setCurrentFloor = jest.fn();
    
    useIndoor.mockReturnValue({
      setCurrentFloor,
      currentFloorAssociations: [
        { floor: '1', component: 'h1Features' }
      ],
      setIndoorFeatures
    });
    
    const { selectIndoorFeatures } = useIndoorFeatures();
    
    selectIndoorFeatures(0);
    
    expect(setIndoorFeatures).toHaveBeenCalled();
    expect(setCurrentFloor).toHaveBeenCalledWith('1st Floor');
  });
  
  test('should handle invalid index or undefined associations', () => {
    const setIndoorFeatures = jest.fn();
    const setCurrentFloor = jest.fn();
    
    useIndoor.mockReturnValue({
      setCurrentFloor,
      currentFloorAssociations: [],
      setIndoorFeatures
    });
    
    const { selectIndoorFeatures } = useIndoorFeatures();
    
    // Test with an invalid index
    selectIndoorFeatures(5);
    
    expect(setIndoorFeatures).toHaveBeenCalledWith([]);
    expect(setCurrentFloor).toHaveBeenCalledWith(null);
  });
  
  test('should handle non-existent feature component', () => {
    const setIndoorFeatures = jest.fn();
    const setCurrentFloor = jest.fn();
    
    useIndoor.mockReturnValue({
      setCurrentFloor,
      currentFloorAssociations: [
        { floor: '1', component: 'nonExistentFeatures' }
      ],
      setIndoorFeatures
    });
    
    const { selectIndoorFeatures } = useIndoorFeatures();
    
    selectIndoorFeatures(0);
    
    expect(setIndoorFeatures).toHaveBeenCalledWith([]);
    expect(setCurrentFloor).toHaveBeenCalledWith(null);
  });
});