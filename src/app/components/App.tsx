import { hot } from 'react-hot-loader';
import React, { Component } from 'react';
import styled, { StyleSheetManager } from 'styled-components';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import 'app/styles';
import Pages from 'app/screens';
import Notifications from './Notifications';
import store, { persistor } from 'app/store';
import Loading from './Loading';

const Main = styled.main`
    position: relative;
`;

class App extends Component {
    componentDidMount(): void {
        document.getElementById('loader').style.display = 'none';
    }

    render(): JSX.Element {
        return (
            <HashRouter>
                <StyleSheetManager disableVendorPrefixes>
                    <Provider store={store}>
                        <PersistGate loading={<Loading />} persistor={persistor}>
                            <div>
                                <Notifications />
                                <Main>
                                    <Pages />
                                </Main>
                                {/* <Telemetry /> */}
                            </div>
                        </PersistGate>
                    </Provider>
                </StyleSheetManager>
            </HashRouter>
        );
    }
}

export default hot(module)(App);