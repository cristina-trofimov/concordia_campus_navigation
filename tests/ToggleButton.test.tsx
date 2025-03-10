// At the top of your test file
jest.mock('../src/components/ToggleButton', () => {
  return function MockToggleButton(props) {
    return 'ToggleButton';
  };
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ToggleButton from '../src/components/ToggleButton';

// Mock Mapbox
jest.mock('@rnmapbox/maps', () => ({
  MapView: 'MapView',
}));

// Mock React Native
jest.mock('react-native', () => {
  const RN = {
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    StyleSheet: {
      create: jest.fn(styles => styles),
      flatten: jest.fn(style => style),
    },
    Animated: {
      View: 'Animated.View',
      Value: jest.fn((initialValue) => ({
        _value: initialValue,
        setValue: jest.fn(),
        interpolate: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(callback => callback && callback()),
      })),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 400, height: 800 })),
    },
  };
  
  return RN;
});

const renderToggleButton = (initialCampus = true) => {
  const mockOnCampusChange = jest.fn();
  const sgwCoords = { latitude: 45.4949968855897, longitude: -73.57794614197633 };
  const loyolaCoords = { latitude: 45.459839, longitude: -73.640329 };
  
  const utils = render(
    <ToggleButton
      mapRef={React.createRef()}
      sgwCoords={sgwCoords}
      loyolaCoords={loyolaCoords}
      onCampusChange={mockOnCampusChange}
      initialCampus={initialCampus}
    />
  );
  
  return {
    ...utils,
    mockOnCampusChange,
  };
};

describe('ToggleButton', () => {
  it('renders correctly with SGW as initial campus', () => {
    const { queryByText } = renderToggleButton(true);
    
    // Check if both campus options are rendered
    expect(queryByText('SGW')).not.toBeNull();
    expect(queryByText('Loyola')).not.toBeNull();
  });
  
  it('renders correctly with Loyola as initial campus', () => {
    const { queryByText } = renderToggleButton(false);
    
    // Check if both campus options are rendered
    expect(queryByText('SGW')).not.toBeNull();
    expect(queryByText('Loyola')).not.toBeNull();
  });

  it('calls onCampusChange with correct value when toggle is pressed (SGW to Loyola)', () => {
    const { UNSAFE_getAllByType, mockOnCampusChange } = renderToggleButton(true);
    
    // Find TouchableOpacity directly
    const touchable = UNSAFE_getAllByType('TouchableOpacity')[0];
    fireEvent.press(touchable);
    
    // Verify the callback is called with the correct value (false = Loyola)
    expect(mockOnCampusChange).toHaveBeenCalledWith(false);
  });
  
  it('calls onCampusChange with correct value when toggle is pressed (Loyola to SGW)', () => {
    const { UNSAFE_getAllByType, mockOnCampusChange } = renderToggleButton(false);
    
    // Find TouchableOpacity directly
    const touchable = UNSAFE_getAllByType('TouchableOpacity')[0];
    fireEvent.press(touchable);
    
    // Verify the callback is called with the correct value (true = SGW)
    expect(mockOnCampusChange).toHaveBeenCalledWith(true);
  });
});