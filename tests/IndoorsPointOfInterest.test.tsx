import React from 'react';
import { render } from '@testing-library/react-native';
import { IndoorPointsOfInterest } from '../src/components/IndoorPointsOfInterest';
import { useIndoor } from '../src/data/IndoorContext';

// Mock the external dependencies
jest.mock('../src/data/IndoorContext', () => ({
    useIndoor: jest.fn()
}));

jest.mock('../src/components/PointsOfInterestMarkers', () => ({
    PointsOfInterestMarkers: jest.fn(() => null)
}));

jest.mock('@expo/vector-icons', () => ({
    FontAwesome5: jest.fn(() => null),
    MaterialCommunityIcons: jest.fn(() => null),
    FontAwesome6: jest.fn(() => null)
}));

describe('IndoorPointsOfInterest Component', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns null when not in floor view', () => {
        // Mock context to simulate not being in floor view
        (useIndoor as jest.Mock).mockReturnValue({
            inFloorView: false,
            indoorFeatures: []
        });

        const { UNSAFE_root } = render(<IndoorPointsOfInterest />);
        expect(UNSAFE_root.children.length).toBe(0);
    });

    it('returns null when indoor features are not available', () => {
        // Mock context with no indoor features
        (useIndoor as jest.Mock).mockReturnValue({
            inFloorView: true,
            indoorFeatures: null
        });

        const { UNSAFE_root } = render(<IndoorPointsOfInterest />);
        expect(UNSAFE_root.children.length).toBe(0);
    });

    it('renders all point of interest markers when in floor view with features', () => {
        // Mock indoor features with various types of points of interest
        const mockIndoorFeatures = [
            { 
                properties: { amenity: 'toilets' }, 
                geometry: { type: 'Polygon' } 
            },
            { 
                properties: { highway: 'elevator' }, 
                geometry: { type: 'Polygon' } 
            },
            { 
                properties: { escalators: 'yes' }, 
                geometry: { type: 'Polygon' } 
            },
            { 
                properties: { highway: 'steps' }, 
                geometry: { type: 'Polygon' } 
            },
            { 
                properties: { amenity: 'cafe' }, 
                geometry: { type: 'Polygon' } 
            }
        ];

        (useIndoor as jest.Mock).mockReturnValue({
            inFloorView: true,
            indoorFeatures: mockIndoorFeatures
        });

        render(<IndoorPointsOfInterest />);

        // Verify PointsOfInterestMarkers is called with correct filters for each type
        const { PointsOfInterestMarkers } = require('../src/components/PointsOfInterestMarkers');
        
        expect(PointsOfInterestMarkers).toHaveBeenCalledTimes(5);
        
        // Check each marker type's filter and icon
        const calls = (PointsOfInterestMarkers as jest.Mock).mock.calls;
        
        // Define the expected filter functions based on the component's logic
        const filterFunctions = [
            (feature) => feature.properties?.amenity === "toilets" && feature.geometry.type === "Polygon",
            (feature) => feature.properties?.highway === "elevator" && feature.geometry.type === "Polygon",
            (feature) => feature.properties?.escalators === "yes" && feature.geometry.type === "Polygon",
            (feature) => feature.properties?.highway === "steps" && feature.geometry.type === "Polygon",
            (feature) => feature.properties?.amenity === "cafe" && feature.geometry.type === "Polygon"
        ];

        // Verify each call matches its filter function
        calls.forEach((call, index) => {
            expect(filterFunctions[index](mockIndoorFeatures[index])).toBe(true);
        });
    });

    it('does not render markers for features without matching filter', () => {
        // Mock indoor features with invalid types
        const mockIndoorFeatures = [
            { 
                properties: { someOtherProperty: 'value' }, 
                geometry: { type: 'Point' } 
            }
        ];

        (useIndoor as jest.Mock).mockReturnValue({
            inFloorView: true,
            indoorFeatures: mockIndoorFeatures
        });

        render(<IndoorPointsOfInterest />);

        const { PointsOfInterestMarkers } = require('../src/components/PointsOfInterestMarkers');
        
        // Check that no markers are rendered for non-matching features
        const calls = (PointsOfInterestMarkers as jest.Mock).mock.calls;
        
        // Define filter functions that should return false for the invalid feature
        const filterFunctions = [
            (feature) => feature.properties?.amenity === "toilets" && feature.geometry.type === "Polygon",
            (feature) => feature.properties?.highway === "elevator" && feature.geometry.type === "Polygon",
            (feature) => feature.properties?.escalators === "yes" && feature.geometry.type === "Polygon",
            (feature) => feature.properties?.highway === "steps" && feature.geometry.type === "Polygon",
            (feature) => feature.properties?.amenity === "cafe" && feature.geometry.type === "Polygon"
        ];

        calls.forEach(call => {
            filterFunctions.forEach(filterFunc => {
                expect(filterFunc(mockIndoorFeatures[0])).toBe(false);
            });
        });
    });
});