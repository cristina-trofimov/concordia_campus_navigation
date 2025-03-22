import React from 'react';
import { render } from '@testing-library/react-native';
import SimpleComponent from './SimpleComponent';

test('renders Hello, World! text', () => {
  const { getByText } = render(<SimpleComponent />);
  expect(getByText('Hello, World!')).toBeTruthy();
});
