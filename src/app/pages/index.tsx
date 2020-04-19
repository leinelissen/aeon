import React from 'react';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import Onboarding from './Onboarding';
import Log from './Log';
import NewCommit from './NewCommit';
import Store from 'app/store';

/**
 * A helper to determine what the starting screen should be for the application.
 */
function initialiseRoute(): JSX.Element {
    const store = Store.useStore();

    // If the user is onboarded already, we can redirect them to the log
    if (store.get('isOnboarded')) {
        return <Redirect to='/log' exact />;
    }
    
    // If not, redirect to onboarding
    return <Redirect to='/onboarding' exact />;
}

function Router(): JSX.Element {
    return (
        <HashRouter >
            <Switch>
                <Route path='/log' component={Log} />
                <Route path='/onboarding' exact component={Onboarding} />
                <Route path="/commit/new" component={NewCommit} />
                <Route path="/" component={initialiseRoute} />
            </Switch>
        </HashRouter>
    );
}

export default Router;