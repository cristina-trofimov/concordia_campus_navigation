import React from 'react';
import renderer from 'react-test-renderer';
import CalendarButton from '../src/components/CalendarButton'; // Adjust this path as needed

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

// Mock FontAwesome
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');

// Mock the styles
jest.mock('../src/styles/CalendarStyle', () => ({
  CalendarStyle: {
    calendarButtonContainer: {},
    calBtn: {},
    calButtonImg: {}
  }
}));

describe('CalendarButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const tree = renderer.create(<CalendarButton />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('navigates to Calendar screen when pressed', () => {
    // Create the component
    const component = renderer.create(<CalendarButton />);
    const root = component.root;
    
    // First, let's examine the component structure to find where the onPress is
    // Get all instances that have an onPress prop
    const instances = root.findAll(
      instance => instance.props && typeof instance.props.onPress === 'function'
    );
    
    // If we found any instances with onPress, use the first one
    expect(instances.length).toBeGreaterThan(0);
    const buttonInstance = instances[0];
    
    // Simulate pressing the button
    buttonInstance.props.onPress();
    
    // Check if navigation was called correctly
    expect(mockNavigate).toHaveBeenCalledWith('Calendar');
  });

  it('includes FontAwesome calendar icon with correct props', () => {
    // Create the component
    const component = renderer.create(<CalendarButton />);
    const root = component.root;
    
    // Find the FontAwesome component
    const icon = root.findByType('FontAwesome');
    
    // Check if the icon has the correct props
    expect(icon.props.name).toBe('calendar');
    expect(icon.props.size).toBe(26);
    expect(icon.props.color).toBe('white');
  });

  it('has the correct style props', () => {
    // Create the component
    const component = renderer.create(<CalendarButton />);
    const root = component.root;
    
    // Find all View components
    const views = root.findAllByType('View');
    expect(views.length).toBeGreaterThan(0);
    
    // Find FontAwesome component for icon style check
    const icon = root.findByType('FontAwesome');
    
    // Find the element with the onPress function (our button)
    const buttonElements = root.findAll(
      instance => instance.props && typeof instance.props.onPress === 'function'
    );
    expect(buttonElements.length).toBeGreaterThan(0);
    const buttonElement = buttonElements[0];
    
    // We're just checking that styles exist rather than their exact values
    // since our mock returns empty objects
    expect(views[0].props).toHaveProperty('style');
    expect(buttonElement.props).toHaveProperty('style');
    expect(icon.props).toHaveProperty('style');
  });
});