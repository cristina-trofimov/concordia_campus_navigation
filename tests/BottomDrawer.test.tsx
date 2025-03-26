import React from 'react';
import { Animated, Dimensions, View } from 'react-native';
import renderer from 'react-test-renderer';
import BottomDrawer from '../src/components/BottomDrawer';

const { height } = Dimensions.get('window');
const COLLAPSED_HEIGHT = height * 0.1;
const EXPANDED_HEIGHT = height * 0.5;
const FULL_EXPANDED_HEIGHT = height * 0.85;

describe('BottomDrawer Component', () => {
  let mockAnimatedValue: Animated.Value;

  beforeEach(() => {
    // Create a mock Animated.Value
    mockAnimatedValue = new Animated.Value(EXPANDED_HEIGHT);
  });

  it('renders correctly with initial expanded state', () => {
    const tree = renderer.create(
      <BottomDrawer drawerHeight={mockAnimatedValue}>
        <React.Fragment>Mock Drawer Content</React.Fragment>
      </BottomDrawer>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should pass drawerHeight prop correctly', () => {
    const testRenderer = renderer.create(
      <BottomDrawer drawerHeight={mockAnimatedValue}>
        <React.Fragment>Mock Drawer Content</React.Fragment>
      </BottomDrawer>
    );
    
    const testInstance = testRenderer.root;
    const animatedView = testInstance.findByType(Animated.View);
    
    expect(animatedView.props.style[1].height).toBe(mockAnimatedValue);
  });

  describe('Height Constraints', () => {
    it('should have predefined height constants', () => {
      expect(COLLAPSED_HEIGHT).toBe(height * 0.1);
      expect(EXPANDED_HEIGHT).toBe(height * 0.5);
      expect(FULL_EXPANDED_HEIGHT).toBe(height * 0.85);
    });
  });

  describe('Drawer Structure', () => {
    it('contains drag handle and content container', () => {
      const testRenderer = renderer.create(
        <BottomDrawer drawerHeight={mockAnimatedValue}>
          <View testID="drawer-content">Mock Drawer Content</View>
        </BottomDrawer>
      );
      
      const testInstance = testRenderer.root;
      
      // Check for drag handle
      const dragHandleViews = testInstance.findAll(
        node => node.type === View && 
                node.props.style !== undefined
      );
      
      // Ensure we have multiple View components
      expect(dragHandleViews.length).toBeGreaterThan(0);

      // Check for content container
      const contentView = testInstance.findAll(
        node => node.type === View && 
                node.props.testID === 'drawer-content'
      );
      expect(contentView.length).toBeGreaterThan(0);
    });

    it('renders children correctly', () => {
      const testRenderer = renderer.create(
        <BottomDrawer drawerHeight={mockAnimatedValue}>
          <View testID="drawer-content">Specific Content</View>
        </BottomDrawer>
      );
      
      const testInstance = testRenderer.root;
      const contentView = testInstance.findByProps({ testID: 'drawer-content' });
      
      expect(contentView.props.children).toBe('Specific Content');
    });
  });

  describe('Animation Capabilities', () => {
    it('uses Animated.View for height animation', () => {
      const testRenderer = renderer.create(
        <BottomDrawer drawerHeight={mockAnimatedValue}>
          <React.Fragment>Mock Drawer Content</React.Fragment>
        </BottomDrawer>
      );
      
      const testInstance = testRenderer.root;
      const animatedViews = testInstance.findAll(
        node => node.type === Animated.View
      );
      
      expect(animatedViews.length).toBeGreaterThan(0);
    });
  });

  describe('Snapshot Testing', () => {
    it('matches previous snapshot', () => {
      const tree = renderer.create(
        <BottomDrawer drawerHeight={mockAnimatedValue}>
          <React.Fragment>Mock Drawer Content</React.Fragment>
        </BottomDrawer>
      ).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});