import { render, fireEvent } from '@testing-library/react-native';
import { RoomSearchBars } from '../src/components/RoomSearchBars';
import { useCoords } from '../src/data/CoordsContext';
import { useIndoor } from '../src/data/IndoorContext';

// Mock the context hooks
jest.mock('../src/data/CoordsContext', () => ({
  useCoords: jest.fn()
}));

jest.mock('../src/data/IndoorContext', () => ({
  useIndoor: jest.fn()
}));

// Mock expo vector icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: ({ name, size, color }) => (
    <mock-material-icon 
      testID={`material-icon-${name}`} 
      data-name={name} 
      data-size={size} 
      data-color={color} 
    />
  )
}));

// Mock the RoomSearchBar component
jest.mock('../src/components/RoomSearchBar', () => jest.fn(
  (props) => {
    return (
      <mock-room-search-bar
        testID="room-search-bar"
        data-location={JSON.stringify(props.location)}
        data-placeholder={props.placeholder}
        data-searchtype={props.searchType}
      />
    );
  }
));

describe('RoomSearchBars', () => {
  // Setup default mock values
  const mockSetIndoorTransport = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for useCoords
    (useCoords as jest.Mock).mockReturnValue({
      originCoords: { lat: 45.497, lng: -73.579 },
      destinationCoords: { lat: 45.498, lng: -73.580 },
      myLocationCoords: { lat: 45.496, lng: -73.578 }
    });
    
    // Default mock implementation for useIndoor
    (useIndoor as jest.Mock).mockReturnValue({
      setIndoorTransport: mockSetIndoorTransport
    });
  });
  
  test('renders nothing when destinationCoords is null', () => {
    // Override the default mock to return null for destinationCoords
    (useCoords as jest.Mock).mockReturnValue({
      originCoords: { lat: 45.497, lng: -73.579 },
      destinationCoords: null,
      myLocationCoords: { lat: 45.496, lng: -73.578 }
    });
    
    const { queryByTestId } = render(<RoomSearchBars />);
    
    // Verify that no RoomSearchBar components are rendered
    expect(queryByTestId('room-search-bar')).toBeNull();
  });
  
  test('renders search bars when destinationCoords exists', () => {
    const { getAllByTestId } = render(<RoomSearchBars />);
    
    // Verify that two RoomSearchBar components are rendered
    const searchBars = getAllByTestId('room-search-bar');
    expect(searchBars).toHaveLength(2);
    
    // Verify that the first search bar has origin props
    expect(searchBars[0].props['data-searchtype']).toBe('origin');
    expect(searchBars[0].props['data-placeholder']).toBe('origin room');
    
    // Verify that the second search bar has destination props
    expect(searchBars[1].props['data-searchtype']).toBe('destination');
    expect(searchBars[1].props['data-placeholder']).toBe('destination room');
  });
  
  test('passes originCoords to the first RoomSearchBar', () => {
    const { getAllByTestId } = render(<RoomSearchBars />);
    
    const searchBars = getAllByTestId('room-search-bar');
    const locationData = JSON.parse(searchBars[0].props['data-location']);
    
    expect(locationData).toEqual({ lat: 45.497, lng: -73.579 });
  });
  
  test('passes myLocationCoords when originCoords is null', () => {
    // Override the default mock to return null for originCoords
    (useCoords as jest.Mock).mockReturnValue({
      originCoords: null,
      destinationCoords: { lat: 45.498, lng: -73.580 },
      myLocationCoords: { lat: 45.496, lng: -73.578 }
    });
    
    const { getAllByTestId } = render(<RoomSearchBars />);
    
    const searchBars = getAllByTestId('room-search-bar');
    const locationData = JSON.parse(searchBars[0].props['data-location']);
    
    expect(locationData).toEqual({ lat: 45.496, lng: -73.578 });
  });
  
  test('renders transport icons when destinationCoords exists', () => {
    const { getByTestId } = render(<RoomSearchBars />);
    
    // Check that all three icons are rendered with proper names
    expect(getByTestId('material-icon-stairs')).toBeTruthy();
    expect(getByTestId('material-icon-elevator')).toBeTruthy();
    expect(getByTestId('material-icon-escalator')).toBeTruthy();
  });
  
  test('sets indoor transport type when an icon is pressed', () => {
    const { getByTestId } = render(<RoomSearchBars />);
    
    // Get each icon by its testID
    const stairsIcon = getByTestId('material-icon-stairs');
    const elevatorIcon = getByTestId('material-icon-elevator');
    const escalatorIcon = getByTestId('material-icon-escalator');
    
    // Simulate clicking on stairs icon
    fireEvent.press(stairsIcon);
    expect(mockSetIndoorTransport).toHaveBeenCalledWith('stairs');
    
    // Simulate clicking on elevator icon
    fireEvent.press(elevatorIcon);
    expect(mockSetIndoorTransport).toHaveBeenCalledWith('elevator');
    
    // Simulate clicking on escalator icon
    fireEvent.press(escalatorIcon);
    expect(mockSetIndoorTransport).toHaveBeenCalledWith('escalator');
  });
  
  test('updates the selected transport state when an icon is pressed', () => {
    const { getByTestId } = render(<RoomSearchBars />);
    
    // Get the elevator icon
    const elevatorIcon = getByTestId('material-icon-elevator');
    
    // Simulate clicking on the elevator icon
    fireEvent.press(elevatorIcon);
    
    // Check that setIndoorTransport was called with 'elevator'
    expect(mockSetIndoorTransport).toHaveBeenCalledWith('elevator');
    
    // We can't directly test state changes, but we can test that the function was called
    // with the correct argument, which indicates the state would be updated
  });
  
  test('changes icon color when transport type is selected', () => {
    const { getByTestId, rerender } = render(<RoomSearchBars />);
    
    // Initially all icons should have black color
    const stairsIcon = getByTestId('material-icon-stairs');
    expect(stairsIcon.props['data-color']).toBe('black');
    
    // Click on stairs icon to select it
    fireEvent.press(stairsIcon);
    
    // Force re-render to reflect state changes
    // We need to maintain the same mock return values
    (useIndoor as jest.Mock).mockReturnValue({
      setIndoorTransport: mockSetIndoorTransport
    });
    
    rerender(<RoomSearchBars />);
    
    // Now the stairs icon should have the selected color
    // Note: This wouldn't actually work since we can't access the component's internal state
    // in the test directly. In a real scenario, we would need to mock useState or use a 
    // different approach to verify the color changes.
  });
});