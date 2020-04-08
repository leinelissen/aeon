import { hot } from 'react-hot-loader';
import React, { Component } from 'react';
import 'app/styles';
import Notifications from './Notifications';
import MenuBar from './MenuBar';
import Pages from 'app/pages';
import styled, { StyleSheetManager } from 'styled-components';
import Store from 'app/store';

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
                <Store.Container>
                    <div>
                        <Notifications />
                        <MenuBar />
                        <Main>
                            <Pages />
                        </Main>
                    </div>
                </Store.Container>
            </StyleSheetManager>
        );
    }
}

export default hot(module)(App);