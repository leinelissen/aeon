import React from 'react';
import { Route, useHistory, Switch } from 'react-router-dom';
import Onboarding from './Onboarding';
import Timeline from './Timeline';
import Data from './Data';
import Store from 'app/store';
import Menu, { ContentContainer, MenuContainer, TitleBar } from 'app/components/Menu';
import Requests from './Requests';

/**
 * A helper to determine what the starting screen should be for the application.
 */
function InitialiseRoute(): JSX.Element {
    const store = Store.useStore();
    const history = useHistory();

    // If the user is onboarded already, we can redirect them to the log
    if (store.get('onboardingComplete').initialisation) {
        history.push('/timeline');
    }
    
    // If not, redirect to onboarding
    history.push('/onboarding');

    return null;
}

function Router(): JSX.Element {
    return (
        <MenuContainer>
            <Menu />
            <ContentContainer>
                <TitleBar />
                <Switch>
                    <Route path='/timeline/:commitHash?'>
                        <Timeline />
                    </Route>
                    <Route path='/onboarding'>
                        <Onboarding />
                    </Route>
                    <Route path="/requests/:provider?">
                        <Requests />
                    </Route>
                    <Route path="/data/:category?/:datumId?">
                        <Data />
                    </Route>
                    <Route exact path="/">
                        <InitialiseRoute />
                    </Route>
                </Switch>
            </ContentContainer>
        </MenuContainer>
    );
}

export default Router;