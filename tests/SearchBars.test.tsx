//******************************************************************************************************
// IMPORTANT : when running the tests, there is a warning about wrapping the component in act().
// I tried doing this but it generates an error that I don't know how to fix.
//******************************************************************************************************

// Mock the entire @expo/vector-icons package first
jest.mock('@expo/vector-icons', () => {
    const { View } = require('react-native');
    return {
        Ionicons: function MockedIonicons(props) {
            return <View {...props} testID="icon-ionicons" />;
        },
        // Add any other icon sets you need here
    };
});

// Mock individual icon components
jest.mock('@expo/vector-icons/Ionicons', () => {
    const { View } = require('react-native');
    return function MockedIonicons(props) {
        return <View {...props} testID="icon-ionicons" />;
    };
});

jest.mock('@expo/vector-icons/Entypo', () => {
    const { View } = require('react-native');
    return function MockedEntypo(props) {
        return <View {...props} testID="icon-entypo" />;
    };
});

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// First, let's define the mocks before importing the actual component
// This ensures that the mocks are in place before the module system resolves the imports

// Mock the context modules with complete implementation matching your component's usage
jest.mock('../src/data/CoordsContext', () => ({
    useCoords: () => ({
        setRouteData: jest.fn(),
        myLocationString: 'My Current Location',
        setIsTransit: jest.fn(),
        originCoords: null,
        setOriginCoords: jest.fn(),
        destinationCoords: null,
        setDestinationCoords: jest.fn(),
    }),
}));

jest.mock('../src/data/IndoorContext', () => ({
    useIndoor: () => ({
        inFloorView: false,
        setInFloorView: jest.fn(),
        setOriginRoom: jest.fn(),
        setDestinationRoom: jest.fn(),
    }),
}));

// Create a proper mockable implementation of getDirections
const mockGetDirections = jest.fn().mockImplementation(() => {
    return Promise.resolve([{
        legs: [{
            duration: { text: '15 mins', value: 900 },
            distance: { text: '2 km', value: 2000 },
            steps: [{ html_instructions: 'Test instruction' }],
            end_location: { lat: 45.123, lng: -73.456 }
        }]
    }]);
});

// Mock Route module
jest.mock('../src/components/Route', () => ({
    __esModule: true,
    default: mockGetDirections
}));

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

// Now import the component to be tested - after all mocks are set up
import SearchBars from '../src/components/SearchBars';

describe('SearchBars Component', () => {
    // Mocked context values that we can manipulate between tests
    const defaultMockContextValues = {
        setRouteData: jest.fn(),
        myLocationString: 'My Current Location',
        setIsTransit: jest.fn(),
        originCoords: null,
        setOriginCoords: jest.fn(),
        destinationCoords: null,
        setDestinationCoords: jest.fn(),
        inFloorView: false,
        setInFloorView: jest.fn(),
        setOriginRoom: jest.fn(),
        setDestinationRoom: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock implementation for getDirections
        mockGetDirections.mockImplementation(() => {
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
        // Override the coordsContext mock for this specific test
        jest.spyOn(require('../src/data/IndoorContext'), 'useIndoor').mockReturnValue({
            inFloorView: false,
            setInFloorView: jest.fn(),
            setOriginRoom: jest.fn(),
            setDestinationRoom: jest.fn(),
        });

        const setRouteDataMock = jest.fn();
        jest.spyOn(require('../src/data/CoordsContext'), 'useCoords').mockReturnValue({
            setRouteData: setRouteDataMock,
            myLocationString: 'My Current Location',
            setIsTransit: jest.fn(),
            originCoords: null,
            setOriginCoords: jest.fn(),
            destinationCoords: null,
            setDestinationCoords: jest.fn(),
        });

        const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Find the destination search bar
        const searchBars = getAllByTestId('search-bar');
        const destinationBar = searchBars.find(bar => bar.props.placeholder === 'Destination');

        // Trigger the clear action
        act(() => {
            destinationBar.props.onClearHandler();
        });

        // Verify setRouteData was called with null
        expect(setRouteDataMock).toHaveBeenCalledWith(null);
    });

    it('shows IndoorViewButton when both origin and destination are selected', async () => {
        const { getAllByTestId, getByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Select origin
        const searchBars = getAllByTestId('search-bar');
        const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');

        await act(async () => {
            originBar.props.onSelectHandler();
        });

        // Check that IndoorViewButton is displayed
        expect(getByTestId('indoor-view-button')).toBeTruthy();
    });

    it('handles my current location correctly when set as origin', async () => {
        const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Our mock returns 'My Current Location' for myLocationString
        // Find origin searchbar and check its value
        const searchBars = getAllByTestId('search-bar');
        const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');

        expect(originBar.props.defaultValue).toBe('My Current Location');
    });

    it('handles errors during route fetching', async () => {
        // Mock getDirections to throw an error for this test
        mockGetDirections.mockImplementationOnce(() => {
            throw new Error('Route fetch failed');
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Select origin to trigger route fetch
        const searchBars = getAllByTestId('search-bar');
        const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');

        await act(async () => {
            originBar.props.onSelectHandler();
        });

        // Check that error was logged
        expect(consoleSpy).toHaveBeenCalledWith(
            "Error in getDirections:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it('handles start button press', async () => {
        const { getAllByTestId, getByText } = render(<SearchBars inputDestination="Test Destination" />);

        // Select origin to enable start button
        const searchBars = getAllByTestId('search-bar');
        const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');

        await act(async () => {
            originBar.props.onSelectHandler();
        });

        // Find and press start button
        const startButton = getByText('Start');
        fireEvent.press(startButton);

        // No specific assertion needed as the Start button doesn't have functionality in the mock
        // This test just ensures the button renders and can be pressed without errors
        expect(startButton).toBeTruthy();
    });
});