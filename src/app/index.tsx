import './polyfill';
import React from 'react'
import { render } from 'react-dom';
import App from './components/App';

// Activate the sourcemaps
window.api.sourceMapSupport.install();

// Initialise React
render(<App />, document.getElementById('root'));