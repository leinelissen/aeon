import { hot } from 'react-hot-loader';
import React, { Component } from 'react';
import 'app/styles';
import MenuBar from './MenuBar';
import Log from 'app/pages/Log';
import styled from 'styled-components';

const Main = styled.main`
    padding-top: 40px;
    position: relative;
`;

class App extends Component {
    render(): JSX.Element {
        return (
            <div>
                <MenuBar />
                <Main>
                    <Log />
                </Main>
            </div>
        );
    }
}

export default hot(module)(App);