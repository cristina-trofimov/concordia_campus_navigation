jest.mock('@env', () => ({
  MAPBOX_TOKEN: 'mock-mapbox-token',
}), { virtual: true });
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
}));
jest.mock('@rnmapbox/maps', () => ({

  PointAnnotation: jest.fn().mockImplementation(({ children }) => children),
}));
jest.mock('../src/data/TokenManager', () => ({
  TokenManager: {
    getMapboxToken: jest.fn(() => 'mock-token-for-tests'),
  },
}));
import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import PointOfInterestMap, { fetchNearbyPOI, reverseGeocode, onPoiClick } from '../src/components/Point-of-interest_Map';
import { PointAnnotation } from '@rnmapbox/maps';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ActivityIndicator, View } from 'react-native';

import * as PoiModule from '../src/components/Point-of-interest_Map';
import { screen } from '@testing-library/react-native';



jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => jest.fn().mockImplementation(() => 'MockedIcon'));

global.fetch = jest.fn();

describe('PointOfInterestMap Component', () => {
  const mockSetInputDestination = jest.fn();
  const mockMyLocationCoords = { latitude: 37.7749, longitude: -122.4194 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ features: [] }),
      })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render loading indicator when isLoading is true', async () => {
    const { findByTestId } = render(
      <View testID="loading-container">
        <ActivityIndicator size="large" color="#6E1A2A" />
      </View>
    );

    const loadingContainer = await findByTestId('loading-container');
    expect(loadingContainer).toBeTruthy();
  });

  it('should fetch POIs when myLocationCoords and selectedPOI are provided', async () => {
    const mockPOIs = {
      features: [
        {
          geometry: { coordinates: [-122.4194, 37.7749] },
          properties: { class: 'food_and_drink', name: 'Test Restaurant' }
        }
      ]
    };

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockPOIs),
      })
    );

    render(
      <PointOfInterestMap
        myLocationCoords={mockMyLocationCoords}
        setInputDestination={mockSetInputDestination}
        selectedPOI="food_and_drink"
        radius={50}
      />
    );

    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/https:\/\/api\.mapbox\.com\/v4\/mapbox\.mapbox-streets-v8\/tilequery\/-122\.4194,37\.7749\.json\?radius=50&layers=poi_label&limit=50&access_token=.*/),
      );
    });
  });

  it('should not fetch POIs when myLocationCoords is null', async () => {
    render(
      <PointOfInterestMap
        myLocationCoords={null}
        setInputDestination={mockSetInputDestination}
        selectedPOI="food_and_drink"
        radius={50}
      />
    );

    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('should not fetch POIs when selectedPOI is undefined', async () => {
    render(
      <PointOfInterestMap
        myLocationCoords={mockMyLocationCoords}
        setInputDestination={mockSetInputDestination}
        selectedPOI={undefined}
        radius={50}
      />
    );

    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('should render POI markers after successful data fetch', async () => {
    const mockPOIs = {
      features: [
        {
          geometry: { coordinates: [-122.4194, 37.7749] },
          properties: { class: 'food_and_drink', name: 'Test Restaurant' }
        },
        {
          geometry: { coordinates: [-122.4195, 37.7750] },
          properties: { class: 'food_and_drink', name: 'Another Restaurant' }
        }
      ]
    };

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockPOIs),
      })
    );

    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, jest.fn()])            // isLoading = false
      .mockImplementationOnce(() => [mockPOIs.features, jest.fn()]) // poi = mockPOIs.features
      .mockImplementationOnce(() => ['food', jest.fn()]);           // currentIcon = 'food'

    render(
      <PointOfInterestMap
        myLocationCoords={mockMyLocationCoords}
        setInputDestination={mockSetInputDestination}
        selectedPOI="food_and_drink"
        radius={50}
      />
    );

    await waitFor(() => {
      expect(MaterialCommunityIcons).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'food',
          size: 30,
          color: 'black'
        }),
        expect.anything()
      );
      expect(MaterialCommunityIcons).toHaveBeenCalledTimes(2);
    });
  });

  it('should call setInputDestination when a POI is clicked', async () => {
    const mockAddress = '123 Test Street, San Francisco, CA';
    const poi = {
      geometry: { coordinates: [-122.4194, 37.7749] },
      properties: { class: 'food_and_drink', name: 'Test Restaurant' },
    };

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          features: [{ place_name: mockAddress }]
        }),
      })
    );

    await act(async () => {
      await onPoiClick(poi, mockSetInputDestination);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/https:\/\/api\.mapbox\.com\/geocoding\/v5\/mapbox\.places\/-122\.4194,37\.7749\.json\?access_token=.*/),
    );
    expect(mockSetInputDestination).toHaveBeenCalledWith(mockAddress);
  });

  it('should filter POIs based on selectedPOI category', async () => {
    const mockPOIs = {
      features: [
        {
          geometry: { coordinates: [-122.4194, 37.7749] },
          properties: { class: 'food_and_drink', name: 'Test Restaurant' }
        }
      ]
    };

    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockPOIs),
      })
    );

    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [false, jest.fn()])            // isLoading = false
      .mockImplementationOnce(() => [mockPOIs.features, jest.fn()]) // poi = mockPOIs.features
      .mockImplementationOnce(() => ['food', jest.fn()]);           // currentIcon = 'food'

    render(
      <PointOfInterestMap
        myLocationCoords={mockMyLocationCoords}
        setInputDestination={mockSetInputDestination}
        selectedPOI="food_and_drink"
        radius={50}
      />
    );

    await waitFor(() => {
      expect(MaterialCommunityIcons).toHaveBeenCalledTimes(1);
      expect(MaterialCommunityIcons).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'food' }),
        expect.anything()
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <PointOfInterestMap
        myLocationCoords={mockMyLocationCoords}
        setInputDestination={mockSetInputDestination}
        selectedPOI="food_and_drink"
        radius={50}
      />
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching nearby POI:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});