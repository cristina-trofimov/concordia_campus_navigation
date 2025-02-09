import React from 'react';
import { render } from '@testing-library/react-native';
import Map from '../src/components/Map'; // Update the import path

describe('Map Component', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<Map />);
    const mapView = getByTestId('map-view'); // Set testID in your component if not present
    expect(mapView).toBeTruthy();
  });
});
