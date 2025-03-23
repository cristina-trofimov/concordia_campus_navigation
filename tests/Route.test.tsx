import axios from 'axios';
import getDirections from '../src/components/Route';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getDirections', () => {
  // Keep track of original console methods
  let originalConsoleError: typeof console.error;
  
  beforeAll(() => {
    // Store original console method before tests
    originalConsoleError = console.error;
    // Silence console output during tests
    console.error = jest.fn();
  });
  
  afterAll(() => {
    // Restore original console method after all tests
    console.error = originalConsoleError;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch directions successfully', async () => {
    // Mock successful response data
    const mockResponse = {
      data: {
        status: 'OK',
        routes: [
          {
            legs: [
              {
                steps: [],
                distance: { text: '10 km', value: 10000 },
                duration: { text: '15 mins', value: 900 }
              }
            ],
            latitude: 37.7749,
            longitude: -122.4194
          }
        ]
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await getDirections('San Francisco', 'Oakland', 'driving');

    // Check if axios was called with correct parameters
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin: 'San Francisco',
          destination: 'Oakland',
          mode: 'driving',
          key: 'AIzaSyDVeg6jawwGFbwdBH7y_qlpXfXuZkkLtUU'
        }
      }
    );

    // Check if the function returns expected result
    expect(result).toEqual(mockResponse.data.routes);
  });

  it('should handle API error response', async () => {
    // Mock error response
    const mockResponse = {
      data: {
        status: 'ZERO_RESULTS',
        routes: []
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);
    
    const result = await getDirections('Invalid Origin', 'Invalid Destination', 'driving');

    // Check error was logged
    expect(console.error).toHaveBeenCalledWith('Directions API Error:', 'ZERO_RESULTS');
    
    // Check function returns null on error
    expect(result).toBeNull();
  });

  it('should handle axios request failure', async () => {
    // Mock axios rejection
    const networkError = new Error('Network Error');
    mockedAxios.get.mockRejectedValueOnce(networkError);
    
    const result = await getDirections('San Francisco', 'Oakland', 'driving');

    // Check error was logged
    expect(console.error).toHaveBeenCalledWith('Error fetching directions:', networkError);
    
    // Check function returns null on error
    expect(result).toBeNull();
  });

  it('should handle empty routes in response', async () => {
    // Mock response with empty routes
    const mockResponse = {
      data: {
        status: 'OK',
        routes: []
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);
    
    const result = await getDirections('San Francisco', 'Oakland', 'driving');

    // Check error was logged
    expect(console.error).toHaveBeenCalledWith('No routes found.');
    
    // Check function returns null on empty routes
    expect(result).toBeNull();
  });
});