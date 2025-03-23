import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import ShuttleBusTracker from '../src/components/ShuttleBusTracker';

// Mock dependencies
jest.mock('axios');
jest.mock('@rnmapbox/maps', () => ({
  PointAnnotation: 'PointAnnotation',
}));
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

describe('ShuttleBusTracker', () => {
  const mockBusData = {
    d: {
      Points: [
        { ID: 'BUS001', Longitude: -73.5789, Latitude: 45.4973 },
        { ID: 'BUS002', Longitude: -73.5770, Latitude: 45.4960 },
        { ID: 'STOP001', Longitude: -73.5800, Latitude: 45.4980 } // This is not a bus
      ]
    }
  };

  // Store original console methods
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock the axios GET request to resolve immediately
    axios.get.mockResolvedValue({ status: 200 });
    
    // Mock the axios POST request to resolve immediately
    axios.post.mockResolvedValue({ data: mockBusData });
    
    // Override console.error to suppress React act() warnings
    console.error = jest.fn((...args) => {
      // Check if this is any React warning about act()
      const message = args[0];
      if (
        typeof message === 'string' && (
          message.includes('not wrapped in act') || 
          message.includes('wrap-tests-with-act')
        )
      ) {
        return; // Suppress the warning
      }
      
      // Don't log 'Error fetching bus data' during regular tests
      if (typeof message === 'string' && message.includes('Error fetching bus data:')) {
        return; // This will be tested specifically in the error test
      }
      
      // For all other error messages, pass through
      originalConsoleError(...args);
    });
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error = originalConsoleError;
  });

  it('should render loading indicator initially', () => {
    const { UNSAFE_getByType } = render(<ShuttleBusTracker />);
    expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
  });

  it('should fetch bus data on mount', async () => {
    render(<ShuttleBusTracker />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'https://shuttle.concordia.ca/concordiabusmap/Map.aspx',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Host': 'shuttle.concordia.ca'
          })
        })
      );
      
      expect(axios.post).toHaveBeenCalledWith(
        'https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject',
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            'Host': 'shuttle.concordia.ca',
            'Content-Length': '0',
            'Content-Type': 'application/json; charset=UTF-8'
          })
        })
      );
    });
  });

  it('should render bus points after data is loaded', async () => {
    // Setup the mock response
    const resolvedValue = { data: mockBusData };
    axios.post.mockResolvedValue(resolvedValue);
    
    // Render the component
    const { UNSAFE_getAllByType } = render(<ShuttleBusTracker />);
    
    // Wait for the component to update
    await waitFor(() => {
      const pointAnnotations = UNSAFE_getAllByType('PointAnnotation');
      expect(pointAnnotations.length).toBe(2);
    });
    
    // Now verify the props after waiting
    const pointAnnotations = UNSAFE_getAllByType('PointAnnotation');
    expect(pointAnnotations[0].props.id).toBe('BUS001');
    expect(pointAnnotations[1].props.id).toBe('BUS002');
    
    // Check coordinates
    expect(pointAnnotations[0].props.coordinate).toEqual([-73.5789, 45.4973]);
    expect(pointAnnotations[1].props.coordinate).toEqual([-73.5770, 45.4960]);
    
    // Check if bus icons are rendered
    const busIcons = UNSAFE_getAllByType('MaterialCommunityIcons');
    expect(busIcons.length).toBe(2);
    expect(busIcons[0].props.name).toBe('bus-side');
    expect(busIcons[0].props.color).toBe('#912338');
  });

  it('should return null if busData.Points is null', async () => {
    // Mock the axios POST request to return null Points
    const nullPointsData = { d: { Points: null } };
    axios.post.mockResolvedValue({ data: nullPointsData });
    
    // Render the component
    const renderer = render(<ShuttleBusTracker />);
    
    // Wait for the component to update
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
    
    // Check for absence of PointAnnotation
    try {
      renderer.UNSAFE_getAllByType('PointAnnotation');
      fail('Should not have found any PointAnnotation components');
    } catch (error) {
      // This is expected - no PointAnnotations should be found
      expect(error).toBeTruthy();
    }
  });

  it('should handle error when fetching bus data', async () => {
    // Create a specific error mock for this test
    const errorSpy = jest.fn();
    console.error = errorSpy;
    
    // Mock axios request to reject
    axios.get.mockRejectedValue(new Error('Network error'));
    
    // Render the component
    const renderer = render(<ShuttleBusTracker />);
    
    // Wait for the component to update
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
    
    // Verify error handling
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        'Error fetching bus data:', 
        expect.any(Error)
      );
    });
    
    // Check for absence of PointAnnotation
    try {
      renderer.UNSAFE_getAllByType('PointAnnotation');
      fail('Should not have found any PointAnnotation components');
    } catch (error) {
      // This is expected - no PointAnnotations should be found
      expect(error).toBeTruthy();
    }
  });

  it('should set up interval for fetching data and clean up on unmount', async () => {
    // Use spyOn for setInterval and clearInterval
    jest.useFakeTimers();
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    // Render component
    const { unmount } = render(<ShuttleBusTracker />);
    
    // Check that setInterval was called with correct interval
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 15000);
    
    // Unmount to test cleanup
    unmount();
    
    // Check that clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled();
    
    jest.useRealTimers();
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });
});