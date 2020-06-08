import { hot } from 'react-hot-loader';
import React, { Component } from 'react';
import 'app/styles';
import Notifications from './Notifications';
import Pages from 'app/pages';
import styled, { StyleSheetManager } from 'styled-components';
import Store from 'app/store';
import { HashRouter } from 'react-router-dom';
import Telemetry from 'app/utilities/Telemetry';

const Main = styled.main`
    /* padding-top: 40px; */
    position: relative;
    height: 100vh;
`;

class App extends Component {
    componentDidMount(): void {
        document.getElementById('loader').style.display = 'none';
    }

    render(): JSX.Element {
        return (
            <HashRouter>
                <StyleSheetManager disableVendorPrefixes>
                    <Store.Container>
                        <div>
                            <Notifications />
                            <Main>
                                <Pages />
                            </Main>
                            {/* <Telemetry /> */}
                        </div>
                    </Store.Container>
                </StyleSheetManager>
            </HashRouter>
        );
    }
}

export default hot(module)(App);