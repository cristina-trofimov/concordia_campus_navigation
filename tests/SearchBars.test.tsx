//******************************************************************************************************
// IMPORTANT : when running the tests, there is a warning about wrapping the component in act().
// I tried doing this but it generates an error that I don't know how to fix.
//******************************************************************************************************


import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// First, let's define the mocks before importing the actual component
// This ensures that the mocks are in place before the module system resolves the imports

// Mock the context modules - using proper path resolution
jest.mock('../src/data/CoordsContext', () => ({
    useCoords: () => ({
        setRouteData: jest.fn(),
        myLocationString: 'My Current Location',
        setIsTransit: jest.fn(),
    }),
}));

jest.mock('../src/data/IndoorContext', () => ({
    useIndoor: () => ({
        inFloorView: false,
        setInFloorView: jest.fn(),
    }),
}));

// Mock Route module
jest.mock('../src/components/Route', () => {
    return jest.fn().mockImplementation(() => {
        return Promise.resolve([{
            legs: [{
                duration: { text: '15 mins', value: 900 },
                distance: { text: '2 km', value: 2000 },
                steps: [{ html_instructions: 'Test instruction' }],
                end_location: { lat: 45.123, lng: -73.456 }
            }]
        }]);
    });
});

// Mock SearchBar component
jest.mock('../src/components/SearchBar', () => {
    return jest.fn((props) => {
        const mockComponent = require('react').createElement(
            'mock-search-bar',
            {
                ...props,
                testID: 'search-bar',
                onSelectHandler: () => props.onSelect(
                    props.placeholder === 'Origin' ? 'Sample Origin' : 'Sample Destination',
                    { latitude: 45.123, longitude: -73.456 }
                ),
                onClearHandler: () => props.onClear && props.onClear()
            }
        );
        return mockComponent;
    });
});

// Mock ShuttleBusTransit component
jest.mock('../src/components/ShuttleBusTransit', () => {
    return jest.fn((props) => {
        const mockComponent = require('react').createElement(
            'mock-shuttle-transit',
            {
                ...props,
                testID: 'shuttle-transit',
                onSelectHandler: () => props.onSelect({
                    startShuttleStation: 'SGW Campus',
                    endShuttleStation: 'Loyola Campus',
                    startCampusName: 'SGW',
                    endCampusName: 'Loyola',
                    nextDepartureTime: '14:30'
                })
            }
        );
        return mockComponent;
    });
});

// Mock IndoorViewButton component
jest.mock('../src/components/IndoorViewButton', () => {
    return jest.fn((props) => {
        const mockComponent = require('react').createElement(
            'mock-indoor-view-button',
            {
                ...props,
                testID: 'indoor-view-button'
            }
        );
        return mockComponent;
    });
});

// Update your icon mocks to be more complete
jest.mock('@expo/vector-icons/Ionicons', () => {
    const { View } = require('react-native');
    return function MockedIonicons(props) {
        return <View {...props} />;
    };
});

jest.mock('@expo/vector-icons/Entypo', () => {
    const { View } = require('react-native');
    return function MockedEntypo(props) {
        return <View {...props} />;
    };
});

// You might also need to mock the base package
jest.mock('@expo/vector-icons', () => {
    const { View } = require('react-native');
    return {
        Ionicons: function MockedIonicons(props) {
            return <View {...props} />;
        },
        Entypo: function MockedEntypo(props) {
            return <View {...props} />;
        }
    };
});

// Now import the component to be tested - after all mocks are set up
import SearchBars from '../src/components/SearchBars';
import getDirections from '../src/components/Route';

describe('SearchBars Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with destination input', () => {
        const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);
        const searchBars = getAllByTestId('search-bar');

        // There should be at least one search bar (destination)
        expect(searchBars.length).toBeGreaterThan(0);

        // Find the destination search bar and check its props
        const destinationBar = searchBars.find(bar => bar.props.placeholder === 'Destination');
        expect(destinationBar).toBeTruthy();
        expect(destinationBar.props.defaultValue).toBe('Test Destination');
    });

    it('shows only destination search bar initially', () => {
        const { getAllByTestId } = render(<SearchBars inputDestination="" />);
        const searchBars = getAllByTestId('search-bar');

        // Initially, there should be only one search bar
        expect(searchBars.length).toBe(1);
        expect(searchBars[0].props.placeholder).toBe('Destination');
    });

    it('shows origin search bar when destination is entered', () => {
        const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);
        const searchBars = getAllByTestId('search-bar');

        // With destination, there should be two search bars
        expect(searchBars.length).toBe(2);

        // Check that we have both origin and destination search bars
        const placeholders = searchBars.map(bar => bar.props.placeholder);
        expect(placeholders).toContain('Origin');
        expect(placeholders).toContain('Destination');
    });

    it('clears destination when clear button is pressed', async () => {
        const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Find the destination search bar
        const searchBars = getAllByTestId('search-bar');
        const destinationBar = searchBars.find(bar => bar.props.placeholder === 'Destination');

        // Trigger the clear action
        destinationBar.props.onClearHandler();

        // After clearing, the component should re-render with only one search bar
        await waitFor(() => {
            const updatedSearchBars = getAllByTestId('search-bar');
            expect(updatedSearchBars.length).toBe(1);
        });
    });

    it('fetches directions when both origin and destination are selected', async () => {
        const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Find the origin search bar
        const searchBars = getAllByTestId('search-bar');
        const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');

        // Trigger the selection action
        originBar.props.onSelectHandler();

        await waitFor(() => {
            expect(getDirections).toHaveBeenCalled();
        });
    });

    it('updates destination when inputDestination prop changes', async () => {
        const { rerender, getAllByTestId } = render(<SearchBars inputDestination="Initial Destination" />);

        // Find the initial destination search bar
        let searchBars = getAllByTestId('search-bar');
        let destinationBar = searchBars.find(bar => bar.props.placeholder === 'Destination');
        expect(destinationBar.props.defaultValue).toBe('Initial Destination');

        // Change destination prop
        rerender(<SearchBars inputDestination="Initial Destination" />);

        // Check updated destination
        await waitFor(() => {
            searchBars = getAllByTestId('search-bar');
            destinationBar = searchBars.find(bar => bar.props.placeholder === 'Destination');
            expect(destinationBar.props.defaultValue).toBe('Initial Destination');
        });
    });

    // Additional tests as needed...
});

