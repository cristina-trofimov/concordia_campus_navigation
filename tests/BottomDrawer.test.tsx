// BottomDrawer.test.tsx
import React from 'react';
import { Animated, Dimensions, View, Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import BottomDrawer from '../src/components/BottomDrawer';

const { height } = Dimensions.get('window');
const COLLAPSED_HEIGHT = height * 0.1;
const EXPANDED_HEIGHT = height * 0.5;
const FULL_EXPANDED_HEIGHT = height * 0.85;

describe('BottomDrawer Component', () => {
  let drawerHeight: Animated.Value;

  beforeEach(() => {
    // Start at EXPANDED_HEIGHT by default.
    drawerHeight = new Animated.Value(EXPANDED_HEIGHT);
    jest.clearAllMocks();
    // Override Animated.spring so that it immediately sets the value.
    jest.spyOn(Animated, 'spring').mockImplementation((animValue, config) => {
      animValue.setValue(config.toValue);
      return { start: () => { } } as any;
    });
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <BottomDrawer drawerHeight={drawerHeight}>
        <View>
          <Text>Test Child</Text>
        </View>
      </BottomDrawer>
    );
    expect(getByText('Test Child')).toBeTruthy();
  });




});
