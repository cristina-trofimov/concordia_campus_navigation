import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ToggleButton from '../src/components/ToggleButton';  // Adjust the path accordingly

jest.mock('@rnmapbox/maps', () => ({
  MapView: 'MapView',
}));

jest.mock('react-native', () => {
    const actualReactNative = jest.requireActual('react-native');
  return {
    StyleSheet: {
      create: () => ({
         container: {
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
                marginTop: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 20,
            },
            slider: {
                width: 80,
                height: 40,
                backgroundColor: '#ccc',
                borderRadius: 20,
                justifyContent: 'center',
                padding: 5,
            },
            knob: {
                width:40,
                height: 40,
                backgroundColor: '#eb5321',
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
            },
            label: {
                fontSize: 12,
                fontWeight: 'bold',
                color: 'white',
            },
      }),
    },
  };
});


describe('ToggleButton', () => {
  const mockOnCampusChange = jest.fn();
  const sgwCoords = { latitude: 45.4949968855897, longitude: -73.57794614197633 };
  const loyolaCoords = { latitude: 45.459839, longitude: -73.640329 };

  it('renders correctly with initial state', () => {
    const { getByTestId } = render(
      <ToggleButton
        mapRef={React.createRef()}
        sgwCoords={sgwCoords}
        loyolaCoords={loyolaCoords}
        onCampusChange={mockOnCampusChange}
        initialCampus={true}
      />
    );

    const knob = getByTestId('knob');
    expect(knob).toHaveStyle({ transform: [{ translateX: 0 }] });
    expect(getByTestId('toggle-button')).toBeTruthy();
  });

  it('toggles campus when pressed', async () => {
    const { getByTestId } = render(
      <ToggleButton
        mapRef={React.createRef()}
        sgwCoords={sgwCoords}
        loyolaCoords={loyolaCoords}
        onCampusChange={mockOnCampusChange}
        initialCampus={true}
      />
    );

    const knob = getByTestId('knob');
    const button = getByTestId('toggle-button');

    // Before toggle
    expect(knob).toHaveStyle({ transform: [{ translateX: 0 }] });

    // Simulate pressing the button to toggle
    fireEvent.press(button);

    // Wait for the animation to finish
    await waitFor(() => expect(knob).toHaveStyle({ transform: [{ translateX: 40 }] }));

    // Verify if the callback is called with the correct value
    expect(mockOnCampusChange).toHaveBeenCalledWith(false);
  });

  it('calls onCampusChange with true when toggled from Loyola to SGW', async () => {
    const { getByTestId } = render(
      <ToggleButton
        mapRef={React.createRef()}
        sgwCoords={sgwCoords}
        loyolaCoords={loyolaCoords}
        onCampusChange={mockOnCampusChange}
        initialCampus={false}
      />
    );

    const button = getByTestId('toggle-button');
    fireEvent.press(button);

    await waitFor(() => expect(mockOnCampusChange).toHaveBeenCalledWith(true));
  });
});
