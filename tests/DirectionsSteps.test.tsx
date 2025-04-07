import React from 'react';
import { render, screen } from '@testing-library/react-native';
import DirectionsSteps from '../src/components/DirectionsSteps';
import { useCoords } from '../src/data/CoordsContext';
import { useIndoor } from '../src/data/IndoorContext';
import getIndoorDirectionText from '../src/components/indoorinstructions';

// Add this mock at the top of your test file, before the imports
// Add this to your existing jest.mock configuration
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@expo/vector-icons/FontAwesome6', () => ({
  name: 'FontAwesome6',
  default: ({ name, size, color }: any) => `${name}-${size}-${color}`
}));


// Mock the contexts
jest.mock('../src/data/CoordsContext', () => ({
  useCoords: jest.fn(),
}));

jest.mock('../src/data/IndoorContext', () => ({
  useIndoor: jest.fn(),
}));

// Mock the indoor direction text function
jest.mock('../src/components/indoorinstructions', () =>
  jest.fn().mockReturnValue(['First message', 'Second message'])
);

// Mock MaterialIcons component from expo
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

describe('DirectionsSteps Component', () => {
  // Default mock setup
  const defaultCoordsMock = {
    routeData: [{
      legs: [{
        steps: [
          {
            html_instructions: 'Walk towards <b>Main Street</b>',
            steps: undefined
          },
          {
            html_instructions: 'Turn <b>right</b> onto Pine Avenue',
            steps: undefined
          },
          {
            html_instructions: 'Destination will be on your left',
            steps: undefined
          }
        ]
      }]
    }],
    isTransit: false
  };

  const defaultIndoorMock = {
    originRoom: { building: 'BuildingA', name: 'Room101' },
    destinationRoom: { building: 'BuildingB', name: 'Room202' },
    indoorTransport: 'elevator'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    useCoords.mockReturnValue(defaultCoordsMock);
    useIndoor.mockReturnValue(defaultIndoorMock);
  });

  test('renders correctly with route data', () => {
    render(<DirectionsSteps />);

    // Check if the first indoor direction message is displayed
    expect(screen.getByText('First message')).toBeTruthy();

    // Check if the second indoor direction message is displayed
    expect(screen.getByText('Second message')).toBeTruthy();

    // Check if all the steps are rendered - note the dot before "Destination"
    expect(screen.getByText('Walk towards Main Street')).toBeTruthy();
    expect(screen.getByText('Turn right onto Pine Avenue')).toBeTruthy();
    expect(screen.getByText('. Destination will be on your left')).toBeTruthy();
  });

  test('renders empty when no route data is available', () => {
    useCoords.mockReturnValue({ routeData: [], isTransit: false });

    render(<DirectionsSteps />);
    // The component should render without instructions
    expect(screen.queryByText('Walk towards Main Street')).toBeNull();
  });

  test('handles transit mode correctly', () => {
    const transitMock = {
      routeData: [{
        legs: [{
          steps: [
            {
              html_instructions: 'Walk to <b>Bus Stop</b>',
              steps: [
                { html_instructions: 'Exit the building' },
                { html_instructions: 'Turn right onto Main Street' }
              ]
            },
            {
              html_instructions: 'Take bus <b>42</b>',
              steps: undefined
            },
            {
              html_instructions: 'Take cool bus',
              travel_mode: 'TRANSIT',
              transit_details: {
                arrival_stop: {
                  name: "STOP"
                },
                line: {
                  vehicle: {
                    name: "Bus"
                  }
                }
              }
            },
            {
              html_instructions: 'Take metro',
              travel_mode: 'TRANSIT',
              transit_details: {
                line: {
                  vehicle: {
                    name: "Subway"
                  }
                }
              }
            },
            {
              html_instructions: 'Take metro',
              travel_mode: 'TRANSIT',
              transit_details: {
                arrival_stop: {
                  name: "STOP"
                },
                line: {
                  vehicle: {
                    name: "Subway"
                  }
                }
              }
            },
          ]
        }]
      }],
      isTransit: true
    };

    useCoords.mockReturnValue(transitMock);

    render(<DirectionsSteps />);

    // In transit mode, it should display detailed steps
    expect(screen.getByText('Walk to Bus Stop')).toBeTruthy();
    expect(screen.getByText('Exit the building')).toBeTruthy();
    expect(screen.getByText('Turn right onto Main Street')).toBeTruthy();
    expect(screen.getByText('Take bus 42')).toBeTruthy();
    expect(screen.getByText('Take cool bus. Take Bus Bus number not found. Get off at stop STOP.')).toBeTruthy();
    expect(screen.getByText('Take metro. Get off at stop Metro stop not found.')).toBeTruthy();
    expect(screen.getByText('Take metro. Get off at stop STOP.')).toBeTruthy();
  });


  test('handles same building scenario correctly', () => {
    // Setup mocks for different buildings to generate outdoor directions
    useCoords.mockReturnValue({
      routeData: [
        {
          legs: [
            {
              steps: [
                {
                  html_instructions: 'Walk towards Main Street',
                  travel_mode: 'WALKING'
                }
              ]
            }
          ]
        }
      ],
      isTransit: false
    });

    useIndoor.mockReturnValue({
      originRoom: { building: 'Building A' },
      destinationRoom: { building: 'Building B' }, // Different building
      indoorTransport: 'walking'
    });

    getIndoorDirectionText.mockReturnValue(['First message', 'Second message']);

    render(<DirectionsSteps />);

    // Since buildings are different, we should expect outdoor instructions
    expect(screen.getByText('Walk towards Main Street')).toBeTruthy();
  });

  test('calls getIndoorDirectionText with correct parameters', () => {
    render(<DirectionsSteps />);

    // Check if getIndoorDirectionText was called with the right parameters
    expect(getIndoorDirectionText).toHaveBeenCalledWith(
      defaultIndoorMock.originRoom,
      defaultIndoorMock.destinationRoom,
      defaultIndoorMock.indoorTransport
    );
  });

  test('displays direction icons based on instruction content', () => {
    const iconsMock = {
      routeData: [{
        legs: [{
          steps: [
            { html_instructions: 'Turn left onto Broadway', steps: undefined },
            { html_instructions: 'Take the bus to Downtown', steps: undefined },
            { html_instructions: 'Continue straight ahead', steps: undefined },
            { html_instructions: 'Head northeast on Park Avenue', steps: undefined }
          ]
        }]
      }],
      isTransit: false
    };

    useCoords.mockReturnValue(iconsMock);

    const { UNSAFE_getAllByType } = render(<DirectionsSteps />);

    // Check that MaterialIcons are present
    const icons = UNSAFE_getAllByType('MaterialIcons');
    expect(icons.length).toBeGreaterThan(0);

    // We should have at least one icon per instruction plus icons for the indoor messages
    expect(icons.length).toBeGreaterThanOrEqual(6); // 4 steps + 2 indoor messages
  });

  test('handles undefined route data gracefully', () => {
    useCoords.mockReturnValue({ routeData: undefined, isTransit: false });

    render(<DirectionsSteps />);
    // Should render without errors but without instructions
    expect(screen.queryByText('Walk towards Main Street')).toBeNull();
  });
});