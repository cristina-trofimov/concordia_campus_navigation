import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import PointOfInterestMap from '../src/components/Point-of-interest_Map';
import { PointAnnotation } from '@rnmapbox/maps';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ActivityIndicator } from 'react-native';

// Import the module directly - we'll mock specific functions
import * as PoiModule from '../src/components/Point-of-interest_Map';

// Mock the dependencies
jest.mock('@rnmapbox/maps', () => ({
  PointAnnotation: jest.fn().mockImplementation(({ children }) => children),
}));

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => jest.fn().mockImplementation(() => 'MockedIcon'));

// Use a proper mock for MAPBOX_TOKEN
jest.mock('@env', () => ({
  MAPBOX_TOKEN: 'mock-mapbox-token',
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('PointOfInterestMap Component', () => {
  const mockSetInputDestination = jest.fn();
  const mockMyLocationCoords = { latitude: 37.7749, longitude: -122.4194 };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default mock responses
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
    // Improved useState mocking
    const setIsLoading = jest.fn();
    const setPoi = jest.fn();
    const setCurrentIcon = jest.fn();

    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, setIsLoading])   // isLoading = true
      .mockImplementationOnce(() => [[], setPoi])           // poi = []
      .mockImplementationOnce(() => [null, setCurrentIcon]); // currentIcon = null

    render(
      <PointOfInterestMap
        myLocationCoords={mockMyLocationCoords}
        setInputDestination={mockSetInputDestination}
        selectedPOI="food_and_drink"
        radius={50}
      />
    );

    // Instead of searching for a testID, just check if ActivityIndicator was called
    expect(ActivityIndicator).toHaveBeenCalled();
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

    // Fast-forward timers to trigger useEffect
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

    // Fast-forward timers to trigger useEffect
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

    // Fast-forward timers to trigger useEffect
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

    // Better state mock implementation
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
      // Since we're mocking the MaterialCommunityIcons to return 'MockedIcon',
      // we can check for that text instead
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
    const mockPOIs = {
      features: [
        {
          geometry: { coordinates: [-122.4194, 37.7749] },
          properties: { class: 'food_and_drink', name: 'Test Restaurant' }
        }
      ]
    };

    const mockAddress = '123 Test Street, San Francisco, CA';

    // Important: Mock the reverseGeocode function directly
    const originalReverseGeocode = PoiModule.reverseGeocode;
    PoiModule.reverseGeocode = jest.fn().mockResolvedValue(mockAddress);

    // Directly test the onPoiClick function
    const poi = mockPOIs.features[0];
    await act(async () => {
      await PoiModule.onPoiClick(poi, mockSetInputDestination);
    });

    expect(PoiModule.reverseGeocode).toHaveBeenCalledWith(37.7749, -122.4194);
    expect(mockSetInputDestination).toHaveBeenCalledWith(mockAddress);

    // Restore the original function
    PoiModule.reverseGeocode = originalReverseGeocode;
  });

  it('should filter POIs based on selectedPOI category', async () => {
    // Create test data
    const mockPOIs = {
      features: [
        {
          geometry: { coordinates: [-122.4194, 37.7749] },
          properties: { class: 'food_and_drink', name: 'Test Restaurant' }
        }
      ]
    };

    // Mock fetch to return our data
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockPOIs),
      })
    );

    // Mock component state
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
    // Set shorter timeout specifically for this test
    jest.setTimeout(10000);

    // Mock console.error
    console.error = jest.fn();

    // Setup state mocks
    const setPoi = jest.fn();
    const setIsLoading = jest.fn();

    jest.spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, setIsLoading])    // isLoading = true initially
      .mockImplementationOnce(() => [[], setPoi])            // poi = []
      .mockImplementationOnce(() => [null, jest.fn()]);      // currentIcon = null

    // Mock fetchNearbyPOI to reject
    const originalFetchNearbyPOI = PoiModule.fetchNearbyPOI;
    PoiModule.fetchNearbyPOI = jest.fn().mockRejectedValue(new Error('Network error'));

    // Render component to trigger useEffect
    render(
      <PointOfInterestMap
        myLocationCoords={mockMyLocationCoords}
        setInputDestination={mockSetInputDestination}
        selectedPOI="food_and_drink"
        radius={50}
      />
    );

    // Run timers to trigger useEffect and the error
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Verify error handling
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Restore original function
    PoiModule.fetchNearbyPOI = originalFetchNearbyPOI;
  });
});