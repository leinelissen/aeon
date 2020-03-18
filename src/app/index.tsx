import React from 'react'
import ReactDOM from 'react-dom';
import App from './components/App';

// Activate the sourcemaps
window.api.sourceMapSupport.install();

// Initialise React
ReactDOM.render(<App />, document.getElementById('root'));
