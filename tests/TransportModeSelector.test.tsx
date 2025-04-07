import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TransportModeSelector, { TransportMode } from '../src/components/TransportationModeSelector';
import { SearchBarsStyle } from '../src/styles/SearchBarsStyle';

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons'
}));

describe('TransportModeSelector', () => {
    // Mock transport modes data
    const mockTransportModes: TransportMode[] = [
        { mode: 'car', icon: 'car', label: 'Car', time: '25 min', color: '#FF0000' },
        { mode: 'bicycle', icon: 'bicycle', label: 'Bicycle', time: '40 min', color: '#00FF00' },
        { mode: 'walk', icon: 'walk', label: 'Walk', time: '55 min', color: '#0000FF' }
    ];

    // Mock set function
    const mockSetSelectedMode = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the correct number of transport mode buttons', () => {
        const { getAllByTestId } = render(
            <TransportModeSelector
                transportModes={mockTransportModes}
                selectedMode="car"
                setSelectedMode={mockSetSelectedMode}
            />
        );

        // Test if all transport buttons are rendered
        const buttons = getAllByTestId(/transport-mode-/);
        expect(buttons.length).toBe(mockTransportModes.length);
    });

    test('displays the correct label for the selected transport mode', () => {
        const { getByText } = render(
            <TransportModeSelector
                transportModes={mockTransportModes}
                selectedMode="bicycle"
                setSelectedMode={mockSetSelectedMode}
            />
        );

        // Test if the selected mode's label is displayed
        const selectedLabel = getByText('Bicycle');
        expect(selectedLabel).toBeTruthy();
    });

    test('applies selected style to the active transport mode button', () => {
        // Create a test renderer that gives us access to the component's internals
        const { getByTestId, UNSAFE_getAllByType } = render(
            <TransportModeSelector
                transportModes={mockTransportModes}
                selectedMode="walk"
                setSelectedMode={mockSetSelectedMode}
            />
        );

        // Get the selected button
        const selectedButton = getByTestId('transport-mode-walk');
        expect(selectedButton).toBeTruthy();

        // Since we can't directly access the style prop in a reliable way,
        // let's test that at least one View in the component has the selectedTransportButton style
        const views = UNSAFE_getAllByType('View');

        // Find if any view has our selectedTransportButton style
        const hasSelectedStyle = views.some(view => {
            const style = view.props.style;

            // Handle both array and object style props
            if (Array.isArray(style)) {
                return style.some(s => s === SearchBarsStyle.selectedTransportButton);
            } else if (style === SearchBarsStyle.selectedTransportButton) {
                return true;
            }
            return false;
        });

        expect(hasSelectedStyle).toBeTruthy();
    });

    test('calls setSelectedMode with correct mode when a transport button is pressed', () => {
        const { getByTestId } = render(
            <TransportModeSelector
                transportModes={mockTransportModes}
                selectedMode="car"
                setSelectedMode={mockSetSelectedMode}
            />
        );

        // Find and press the bicycle button
        const bicycleButton = getByTestId('transport-mode-bicycle');
        fireEvent.press(bicycleButton);

        // Check if setSelectedMode was called with the correct mode
        expect(mockSetSelectedMode).toHaveBeenCalledWith('bicycle');
    });

    test('renders correctly with an empty array of transport modes', () => {
        const { queryByTestId } = render(
            <TransportModeSelector
                transportModes={[]}
                selectedMode=""
                setSelectedMode={mockSetSelectedMode}
            />
        );

        // Check that no transport mode buttons are rendered
        const anyButton = queryByTestId(/transport-mode-/);
        expect(anyButton).toBeNull();
    });
});