import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ToggleButton from './ToggleButton';

// Mock the Dimensions API
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
    get: jest.fn().mockReturnValue({ width: 400, height: 800 }),
}));

describe('ToggleButton', () => {
    const mockMapRef = { current: {} };
    const mockSgwCoords = { latitude: 45.496721, longitude: -73.578980 };
    const mockLoyolaCoords = { latitude: 45.458239, longitude: -73.640469 };
    const mockOnCampusChange = jest.fn();

    const defaultProps = {
        mapRef: mockMapRef,
        sgwCoords: mockSgwCoords,
        loyolaCoords: mockLoyolaCoords,
        onCampusChange: mockOnCampusChange,
    };

    it('renders correctly with default props', () => {
        const { getByText } = render(<ToggleButton {...defaultProps} />);
        expect(getByText('Loyola')).toBeTruthy();
        expect(getByText('SGW')).toBeTruthy();
    });

    it('initializes with SGW selected by default', () => {
        const { getByText } = render(<ToggleButton {...defaultProps} />);
        expect(getByText('SGW').props.style).toContainEqual({ color: 'white' });
        expect(getByText('Loyola').props.style).toContainEqual({ color: 'black' });
    });

    it('initializes with Loyola selected when initialCampus is false', () => {
        const { getByText } = render(<ToggleButton {...defaultProps} initialCampus={false} />);
        expect(getByText('Loyola').props.style).toContainEqual({ color: 'white' });
        expect(getByText('SGW').props.style).toContainEqual({ color: 'black' });
    });

    it('toggles between campuses when pressed', () => {
        const { getByText } = render(<ToggleButton {...defaultProps} />);
        const toggleButton = getByText('Loyola').parent.parent;

        fireEvent.press(toggleButton);
        expect(mockOnCampusChange).toHaveBeenCalledWith(false);

        fireEvent.press(toggleButton);
        expect(mockOnCampusChange).toHaveBeenCalledWith(true);
    });

    it('applies correct styles based on screen dimensions', () => {
        const { getByTestId } = render(<ToggleButton {...defaultProps} testID="toggle-button" />);
        const toggleButton = getByTestId('toggle-button');

        expect(toggleButton.props.style).toContainEqual({
            width: 200,
            height: 40,
            borderRadius: 20,
        });
    });
});