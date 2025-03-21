import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Animated, Dimensions } from 'react-native';
import LeftDrawer from '../src/LeftDrawer';

// Mock the necessary components and modules
jest.mock('@expo/vector-icons/Feather', () => 'Feather');
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Mock Animated module properly
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const animatedValue = {
    setValue: jest.fn(),
    interpolate: jest.fn(() => ({ interpolate: jest.fn() })),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  };
  
  return {
    Value: jest.fn(() => animatedValue),
    ValueXY: jest.fn(() => ({
      x: animatedValue,
      y: animatedValue,
    })),
    timing: jest.fn(() => ({
      start: jest.fn(cb => cb && cb()),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(cb => cb && cb()),
    })),
    decay: jest.fn(() => ({
      start: jest.fn(),
    })),
    View: 'Animated.View',
    createAnimatedComponent: jest.fn(component => component),
    event: jest.fn(),
    add: jest.fn(),
    multiply: jest.fn(),
    subtract: jest.fn(),
    divide: jest.fn(),
    modulo: jest.fn(),
    diffClamp: jest.fn(),
  };
});

// Mock Animated independently to ensure our tests work
const mockAnimatedValue = {
  setValue: jest.fn(),
  interpolate: jest.fn(),
};

// Mock Dimensions.get
jest.spyOn(Dimensions, 'get').mockImplementation((dim) => {
  if (dim === 'window') {
    return { width: 375, height: 812 };
  }
  return { width: 0, height: 0 };
});

describe('LeftDrawer Component', () => {
  // Create a mock of the Animated.Value before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Spy on Animated.timing and override implementation
    jest.spyOn(Animated, 'timing').mockImplementation(() => ({
      start: jest.fn(callback => callback && callback()),
    }));
  });

  it('renders correctly', () => {
    const { UNSAFE_getByType } = render(<LeftDrawer />);
    // Just verify the component renders without errors
    expect(UNSAFE_getByType('View')).toBeTruthy();
  });

  it('toggles drawer visibility when button is pressed', () => {
    // Use a spy instead of directly accessing state
    const setStateSpy = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy.mockImplementation((initialState) => {
      // First call is for isDrawerVisible
      if (typeof initialState === 'boolean') {
        return [false, setStateSpy];
      }
      // Return original implementation for other useState calls
      return [initialState, jest.fn()];
    });

    const { UNSAFE_getAllByType } = render(<LeftDrawer />);
    
    // Find the button (TouchableOpacity with Ionicons child)
    const buttons = UNSAFE_getAllByType('TouchableOpacity');
    const menuButton = buttons.find(button => {
      const children = button.props.children;
      return children && children.type === 'Ionicons' && children.props.name === 'reorder-three-outline';
    });
    
    // Press the button
    fireEvent.press(menuButton);
    
    // Check if state setter was called with the opposite value
    expect(setStateSpy).toHaveBeenCalledWith(true);
    
    // Clean up
    useStateSpy.mockRestore();
  });

  it('starts opening animation when drawer becomes visible', () => {
    // Mock useState to control the isDrawerVisible state
    const useStateSpy = jest.spyOn(React, 'useState');
    
    // Mock first for isDrawerVisible to be true, then use original implementation
    let isDrawerVisibleSetter;
    useStateSpy.mockImplementation((initialState) => {
      if (typeof initialState === 'boolean') {
        isDrawerVisibleSetter = jest.fn();
        return [true, isDrawerVisibleSetter]; // Set drawer visible
      }
      // For other useState calls (like Animated.Value)
      return [initialState, jest.fn()];
    });

    render(<LeftDrawer />);
    
    // Verify animation was triggered for opening
    expect(Animated.timing).toHaveBeenCalled();
    const animationCall = Animated.timing.mock.calls[0];
    expect(animationCall[1]).toEqual(expect.objectContaining({
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }));
    
    // Clean up
    useStateSpy.mockRestore();
  });

  it('starts closing animation when drawer becomes hidden', () => {
    // First mock useState to make drawer visible
    const useStateSpy = jest.spyOn(React, 'useState');
    let setIsDrawerVisible;
    
    // First render with drawer visible
    useStateSpy.mockImplementationOnce(() => {
      setIsDrawerVisible = jest.fn();
      return [true, setIsDrawerVisible]; // Drawer initially visible
    });
    
    const { rerender } = render(<LeftDrawer />);
    
    // Clear animation calls from initial render
    Animated.timing.mockClear();
    
    // Now simulate state change to hide drawer
    useStateSpy.mockImplementationOnce(() => {
      return [false, setIsDrawerVisible]; // Drawer now hidden
    });
    
    // Rerender to trigger useEffect
    rerender(<LeftDrawer />);
    
    // Verify animation was triggered for closing
    expect(Animated.timing).toHaveBeenCalled();
    const animationCall = Animated.timing.mock.calls[0];
    expect(animationCall[1]).toEqual(expect.objectContaining({
      toValue: -375, // Width from Dimensions mock
      duration: 300,
      useNativeDriver: true,
    }));
    
    // Clean up
    useStateSpy.mockRestore();
  });

  it('hides drawer when overlay is pressed', () => {
    // Mock useState to control the isDrawerVisible state
    const useStateSpy = jest.spyOn(React, 'useState');
    const setIsDrawerVisible = jest.fn();
    
    // Mock first useState call to return true for isDrawerVisible
    useStateSpy.mockImplementation((initialState) => {
      if (typeof initialState === 'boolean') {
        return [true, setIsDrawerVisible]; // drawer is visible
      }
      // For other useState calls
      return [initialState, jest.fn()];
    });

    const { UNSAFE_getAllByType } = render(<LeftDrawer />);
    
    // Find overlay - TouchableOpacity with overlay style
    const touchables = UNSAFE_getAllByType('TouchableOpacity');
    const overlay = touchables.find(t => 
      t.props.style && 
      typeof t.props.style === 'object' && 
      t.props.style.hasOwnProperty('backgroundColor')
    );
    
    // Simulate press on overlay
    fireEvent.press(overlay);
    
    // Verify overlay press handler was called and state was updated
    expect(setIsDrawerVisible).toHaveBeenCalledWith(false);
    
    // Clean up
    useStateSpy.mockRestore();
  });

  it('logs correct messages when menu items are pressed', () => {
    // Mock console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Make drawer visible for testing menu items
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy.mockImplementation((initialState) => {
      if (typeof initialState === 'boolean') {
        return [true, jest.fn()]; // drawer is visible
      }
      return [initialState, jest.fn()];
    });

    const { getByText } = render(<LeftDrawer />);
    
    // Test each menu item
    fireEvent.press(getByText('Your Favorites'));
    expect(consoleSpy).toHaveBeenCalledWith('your favorites was presses');
    
    fireEvent.press(getByText('Your Timeline'));
    expect(consoleSpy).toHaveBeenCalledWith('your timeline was presses');
    
    fireEvent.press(getByText('Help & Feedback'));
    expect(consoleSpy).toHaveBeenCalledWith('help & feedback was presses');
    
    fireEvent.press(getByText('Settings'));
    expect(consoleSpy).toHaveBeenCalledWith('settings was presses');
    
    // Clean up
    consoleSpy.mockRestore();
    useStateSpy.mockRestore();
  });

  it('closes drawer when onRequestClose is triggered', () => {
    // Mock useState to make drawer visible
    const useStateSpy = jest.spyOn(React, 'useState');
    const setIsDrawerVisible = jest.fn();
    
    useStateSpy.mockImplementation((initialState) => {
      if (typeof initialState === 'boolean') {
        return [true, setIsDrawerVisible]; // drawer is visible
      }
      return [initialState, jest.fn()];
    });

    const { UNSAFE_getByType } = render(<LeftDrawer />);
    
    // Get Modal component
    const modal = UNSAFE_getByType('Modal');
    
    // Trigger onRequestClose (simulates back button)
    act(() => {
      modal.props.onRequestClose();
    });
    
    // Verify drawer was closed
    expect(setIsDrawerVisible).toHaveBeenCalledWith(false);
    
    // Clean up
    useStateSpy.mockRestore();
  });
});