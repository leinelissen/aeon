import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Onboarding from './Onboarding';
import Log from './Log';

function Router(): JSX.Element {
    return (
        <HashRouter >
            <Switch>
                <Route path='/log' component={Log} />
                <Route path='/' exact component={Onboarding} />
            </Switch>
        </HashRouter>
    );
}

export default Router;