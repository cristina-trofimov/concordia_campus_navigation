import 'react-native';
import React from 'react';
import App from '../App';
import {render, fireEvent} from '@testing-library/react-native'

describe(App,() =>{
    it('Does our app start up', function() {
    const{getByTestID}=render(<App />);
    const image = getByTestID('Image');
    expect(image).toBeTruthy();
    });})