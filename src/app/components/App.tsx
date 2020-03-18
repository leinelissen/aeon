import { hot } from 'react-hot-loader';
import React, { Component } from 'react';
import 'app/styles';
import MenuBar from './MenuBar';
import Log from 'app/pages/Log';
import styled, { StyleSheetManager } from 'styled-components';

const Main = styled.main`
    padding-top: 40px;
    position: relative;
`;

class App extends Component {
    componentDidMount(): void {
        document.getElementById('loader').style.display = 'none';
    }

    render(): JSX.Element {
        return (
            <StyleSheetManager disableVendorPrefixes>
                <div>
                    <MenuBar />
                    <Main>
                        <Log />
                    </Main>
                </div>
            </StyleSheetManager>
        );
    }
}

export default hot(module)(App);