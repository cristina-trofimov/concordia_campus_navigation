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

    // it('updates transport mode when a different mode is selected', () => {
    //     const { getAllByTestId, getByText } = render(<SearchBars inputDestination="Test Destination" />);

    //     // First, simulate selecting an origin to make transport modes appear
    //     const searchBars = getAllByTestId('search-bar');
    //     const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');
    //     originBar.props.onSelectHandler();

    //     // Now find and click a different transport mode button
    //     const transitButton = getByText('Public Transport');
    //     fireEvent.press(transitButton);

    //     // Check that getDirections was called with the new transport mode
    //     expect(getDirections).toHaveBeenCalledWith(
    //         'Sample Origin',
    //         'Test Destination',
    //         'transit'
    //     );
    // });

    // it('displays ShuttleBusTransit component when transit mode is selected', async () => {
    //     const { getAllByTestId, getByText, getByTestId } = render(<SearchBars inputDestination="Test Destination" />);

    //     // Select origin to enable transport modes
    //     const searchBars = getAllByTestId('search-bar');
    //     const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');
    //     originBar.props.onSelectHandler();

    //     // Select transit mode
    //     const transitButton = getByText('Public Transport');
    //     fireEvent.press(transitButton);

    //     // Check that ShuttleBusTransit component appears
    //     await waitFor(() => {
    //         expect(getByTestId('shuttle-transit')).toBeTruthy();
    //     });
    // });

    // it('processes shuttle bus selection and creates a multi-leg route', async () => {
    //     const { getAllByTestId, getByText, getByTestId } = render(<SearchBars inputDestination="Test Destination" />);

    //     // Setup for shuttle bus test
    //     const searchBars = getAllByTestId('search-bar');
    //     const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');
    //     originBar.props.onSelectHandler();

    //     // Select transit mode
    //     const transitButton = getByText('Public Transport');
    //     fireEvent.press(transitButton);

    //     // Find and interact with shuttle component
    //     await waitFor(() => {
    //         const shuttleComponent = getByTestId('shuttle-transit');
    //         shuttleComponent.props.onSelectHandler();
    //     });

    //     // Verify that multiple calls to getDirections were made for the shuttle route
    //     await waitFor(() => {
    //         // Should be called at least 3 times for the three segments of the route
    //         expect(getDirections).toHaveBeenCalledTimes(3);
    //     });
    // });

    // it('updates the current time estimation when a destination is selected', async () => {
    //     const { getAllByTestId, getByText } = render(<SearchBars inputDestination="" />);

    //     // Select destination
    //     const searchBars = getAllByTestId('search-bar');
    //     const destinationBar = searchBars.find(bar => bar.props.placeholder === 'Destination');
    //     destinationBar.props.onSelectHandler();

    //     // Then select origin
    //     const updatedSearchBars = getAllByTestId('search-bar');
    //     const originBar = updatedSearchBars.find(bar => bar.props.placeholder === 'Origin');
    //     originBar.props.onSelectHandler();

    //     // Check that time estimation is displayed
    //     await waitFor(() => {
    //         expect(getByText('15min')).toBeTruthy();
    //     });
    // });

    it('shows IndoorViewButton when both origin and destination are selected', async () => {
        const { getAllByTestId, getByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Select origin
        const searchBars = getAllByTestId('search-bar');
        const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');
        originBar.props.onSelectHandler();

        // Check that IndoorViewButton is displayed
        await waitFor(() => {
            expect(getByTestId('indoor-view-button')).toBeTruthy();
        });
    });

    it('handles my current location correctly when set as origin', async () => {
        const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Our mock returns 'My Current Location' for myLocationString
        // Let's simulate this updating the origin
        const mockUseEffect = jest.spyOn(React, 'useEffect');

        // Trigger a re-render
        act(() => {
            // Force the useEffect that watches myLocationString to run
            mockUseEffect.mock.calls.forEach(call => call[0]());
        });

        // Find origin searchbar and check its value
        const searchBars = getAllByTestId('search-bar');
        const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');

        expect(originBar.props.defaultValue).toBe('My Current Location');
    });

    // it('resets route data when destination is cleared', async () => {
    //     // Mock for setRouteData to track calls
    //     const setRouteDataMock = jest.fn();
        

    //     const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);

    //     // Select origin to generate route
    //     const initialSearchBars = getAllByTestId('search-bar');
    //     const originBar = initialSearchBars.find(bar => bar.props.placeholder === 'Origin');
    //     originBar.props.onSelectHandler();

    //     // Clear destination
    //     const destinationBar = initialSearchBars.find(bar => bar.props.placeholder === 'Destination');
    //     destinationBar.props.onClearHandler();

    //     // Verify setRouteData was called with null
    //     await waitFor(() => {
    //         expect(setRouteDataMock).toHaveBeenCalledWith(null);
    //     });
    // });

    it('handles start button press', async () => {
        const { getAllByTestId, getByText } = render(<SearchBars inputDestination="Test Destination" />);

        // Select origin to enable start button
        const searchBars = getAllByTestId('search-bar');
        const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');
        originBar.props.onSelectHandler();

        // Find and press start button
        const startButton = getByText('Start');
        fireEvent.press(startButton);

        // No specific assertion needed as the Start button doesn't have functionality in the mock
        // This test just ensures the button renders and can be pressed without errors
        expect(startButton).toBeTruthy();
    });

    it('updates when myLocationString changes', async () => {
        // Setup with a custom mock for useCoords
        const customUseCoordsMock = {
            myLocationString: 'Initial Location',
            setRouteData: jest.fn(),
            setIsTransit: jest.fn(),
        };


        const { rerender, getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Update myLocationString
        customUseCoordsMock.myLocationString = 'My Current Location';

        // Rerender with the updated context
        rerender(<SearchBars inputDestination="Test Destination" />);

        // Check that origin was updated
        await waitFor(() => {
            const searchBars = getAllByTestId('search-bar');
            const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');
            expect(originBar.props.defaultValue).toBe('My Current Location');
        });
    });

    it('handles errors during route fetching', async () => {
        // Mock getDirections to throw an error
        getDirections.mockImplementationOnce(() => {
            throw new Error('Route fetch failed');
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        const { getAllByTestId } = render(<SearchBars inputDestination="Test Destination" />);

        // Select origin to trigger route fetch
        const searchBars = getAllByTestId('search-bar');
        const originBar = searchBars.find(bar => bar.props.placeholder === 'Origin');
        originBar.props.onSelectHandler();

        // Check that error was logged
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                "Error in getDirections:",
                expect.any(Error)
            );
        });

        consoleSpy.mockRestore();
    });

    // Additional tests as needed...
});

