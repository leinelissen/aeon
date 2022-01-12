import './polyfill';
import React from 'react';
import { render } from 'react-dom';
import App from './components/App';

// Activate the sourcemaps
window.api.sourceMapSupport.install();

// Log unhandlred rejections as warnings to the console
// NOTE: This mainly serves to catch async react-spring errors
// that are thrown when an animation is cancelled early.
window.addEventListener('unhandledrejection', (err) => {
    console.warn(err.reason);
    err.preventDefault();
});

// Initialise React
render(<App />, document.getElementById('root'));