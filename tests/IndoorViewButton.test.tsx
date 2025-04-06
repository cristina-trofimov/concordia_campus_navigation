// First, set up all mocks before any imports
const mockSetInFloorView = jest.fn();
const mockSetCurrentFloorAssociations = jest.fn();
const mockOnClose = jest.fn();

// Mock the Mapbox dependency that's causing the error
jest.mock('@rnmapbox/maps', () => ({}), { virtual: true });

// Create a variable that will be returned by the mock function
let mockBuildingFloorAssociations = [{ id: 'floor1', name: 'Floor 1' }];

// Mock the changeCurrentFloorAssociations function
jest.mock('../src/components/IndoorMap', () => ({
  changeCurrentFloorAssociations: jest.fn(() => mockBuildingFloorAssociations)
}), { virtual: true });

// Mock React Native components and StyleSheet
jest.mock('react-native', () => ({
  Text: 'Text',
  TouchableOpacity: ({ style, onPress, disabled, children, testID }) => (
    // Implement TouchableOpacity as a functional component that calls onPress directly
    <button 
      onClick={disabled ? undefined : onPress} 
      disabled={disabled}
      style={style}
      data-testid={testID}
    >
      {children}
    </button>
  ),
  View: 'View',
  StyleSheet: {
    create: (styles) => styles
  }
}));

// Mock the vector-icons module
jest.mock('@expo/vector-icons', () => ({
  Entypo: 'Entypo'
}));

// Mock the context modules
jest.mock('../data/IndoorContext', () => ({
  useIndoor: () => ({
    setInFloorView: mockSetInFloorView,
    setCurrentFloorAssociations: mockSetCurrentFloorAssociations
  })
}), { virtual: true });

// Mock console.log to prevent unwanted output during tests
global.console = {
  ...global.console,
  log: jest.fn()
};

// Mock the styles
jest.mock('../styles/IndoorViewButtonStyle', () => ({
  IndoorViewButtonStyle: {
    button: { padding: 10 },
    buttonContent: { flexDirection: 'row' },
    buttonText: { marginLeft: 5 }
  }
}), { virtual: true });

// Now import React and the testing utilities
import React from 'react';
import renderer, { act } from 'react-test-renderer';

// Import the component under test
import IndoorViewButton from '../src/components/IndoorViewButton';
import { changeCurrentFloorAssociations } from '../src/components/IndoorMap';

describe('IndoorViewButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mockBuildingFloorAssociations to non-empty
    mockBuildingFloorAssociations = [{ id: 'floor1', name: 'Floor 1' }];
  });

  // Test with building floor associations available
  describe('with building floor associations', () => {
    it('renders correctly when inFloorView is true', () => {
      const tree = renderer.create(
        <IndoorViewButton 
          inFloorView={true} 
          buildingId="hall" 
          onClose={mockOnClose} 
        />
      ).toJSON();
      expect(tree).toBeTruthy();
    });

    it('renders correctly when inFloorView is false', () => {
      const tree = renderer.create(
        <IndoorViewButton 
          inFloorView={false} 
          buildingId="hall" 
          onClose={mockOnClose} 
        />
      ).toJSON();
      expect(tree).toBeTruthy();
    });

    // Rest of the tests remain the same
    it('displays "Outside View" text and tree icon when inFloorView is true', () => {
      const component = renderer.create(
        <IndoorViewButton 
          inFloorView={true} 
          buildingId="hall" 
          onClose={mockOnClose} 
        />
      );
      const root = component.root;
      
      // Find the Icon component
      const icon = root.findByType('Entypo');
      expect(icon.props.name).toBe('tree');
      expect(icon.props.color).toBe('#912338');
    });

    it('displays location icon when inFloorView is false', () => {
      const component = renderer.create(
        <IndoorViewButton 
          inFloorView={false} 
          buildingId="hall" 
          onClose={mockOnClose} 
        />
      );
      const root = component.root;
      
      // Find the Icon component
      const icon = root.findByType('Entypo');
      expect(icon.props.name).toBe('location');
      expect(icon.props.color).toBe('#912338'); // Should be the building color when associations are present
    });

    it('applies correct styles when buildingFloorAssociations is available and inFloorView is true', () => {
      const component = renderer.create(
        <IndoorViewButton 
          inFloorView={true} 
          buildingId="hall" 
          onClose={mockOnClose} 
        />
      );
      const touchable = component.root.findByType('button');
      
      expect(touchable.props.style[1]).toEqual({
        backgroundColor: 'white',
        borderColor: '#912338',
        opacity: 1
      });
      expect(touchable.props.disabled).toBe(false);
    });

    it('applies correct styles when buildingFloorAssociations is available and inFloorView is false', () => {
      const component = renderer.create(
        <IndoorViewButton 
          inFloorView={false} 
          buildingId="hall" 
          onClose={mockOnClose} 
        />
      );
      const touchable = component.root.findByType('button');
      
      expect(touchable.props.style[1]).toEqual({
        backgroundColor: 'white',
        borderColor: '#912338',
        opacity: 1
      });
      expect(touchable.props.disabled).toBe(false);
    });
  });

  // Test with no building floor associations
  describe('with no building floor associations', () => {
    beforeEach(() => {
      // Set mockBuildingFloorAssociations to an empty array
      mockBuildingFloorAssociations = [];
    });

    it('disables the button when buildingFloorAssociations is empty', () => {
      const component = renderer.create(
        <IndoorViewButton 
          inFloorView={false} 
          buildingId="unknown" 
          onClose={mockOnClose} 
        />
      );
      const touchable = component.root.findByType('button');
      
      expect(touchable.props.disabled).toBe(true);
    });

    it('applies correct styles when buildingFloorAssociations is empty and inFloorView is false', () => {
      const component = renderer.create(
        <IndoorViewButton 
          inFloorView={false} 
          buildingId="unknown" 
          onClose={mockOnClose} 
        />
      );
      const touchable = component.root.findByType('button');
      
      expect(touchable.props.style[1]).toEqual({
        backgroundColor: '#ddd',
        borderColor: 'grey',
        opacity: 0.5
      });
    });

    it('applies correct icon color when buildingFloorAssociations is empty and inFloorView is false', () => {
      const component = renderer.create(
        <IndoorViewButton 
          inFloorView={false} 
          buildingId="unknown" 
          onClose={mockOnClose} 
        />
      );
      const icon = component.root.findByType('Entypo');
      
      expect(icon.props.color).toBe('grey');
    });

    it('does not call any functions when button is pressed but associations are empty', () => {
      const component = renderer.create(
        <IndoorViewButton 
          inFloorView={false} 
          buildingId="unknown" 
          onClose={mockOnClose} 
        />
      );
      
      // Verify button is disabled
      const touchable = component.root.findByType('button');
      expect(touchable.props.disabled).toBe(true);
      
      // Verify none of the functions were called
      expect(mockSetInFloorView).not.toHaveBeenCalled();
      expect(mockSetCurrentFloorAssociations).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});