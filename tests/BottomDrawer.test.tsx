// Completely mock all dependencies
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native', () => ({
  Dimensions: { get: jest.fn().mockReturnValue({ height: 1000, width: 500 }) },
  StyleSheet: { create: jest.fn(styles => styles) },
  View: 'View',
  PanResponder: { create: jest.fn() },
  Animated: {
    Value: jest.fn(),
    View: 'Animated.View',
    spring: jest.fn().mockReturnValue({ start: jest.fn() })
  },
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity'
}));
jest.mock('../src/components/SearchBars', () => 'SearchBars');
jest.mock('../src/data/CoordsContext', () => ({
  useCoords: jest.fn().mockReturnValue({ routeData: null })
}));

// Simple test that just checks if component can be imported
describe('BottomDrawer', () => {
  it('can be imported', () => {
    const BottomDrawer = require('../src/components/BottomDrawer').default;
    expect(BottomDrawer).toBeDefined();
  });
});