import React, { Component } from 'react';
import 'app/styles';
import MenuBar from './MenuBar';

class App extends Component {
    render(): JSX.Element[] {
        return [
            <MenuBar />,
            <h1>REACT!</h1>
        ];
    }
}

export default App;