import React, { useEffect } from 'react';
import { Route, useHistory, Switch } from 'react-router-dom';
import Onboarding from './Onboarding';
import Timeline from './Timeline';
import Data from './Data';
import { State } from 'app/store';
import Menu, { ContentContainer, MenuContainer, TitleBar } from 'app/components/Menu';
import Requests from './Requests';
import { useSelector } from 'react-redux';
import Settings from './Settings';
import Graph from './Graph';

/**
 * A helper to determine what the starting screen should be for the application.
 */
function InitialiseRoute(): JSX.Element {
    const initialisationComplete = useSelector((state: State) => state.onboarding.initialisation);
    const history = useHistory();

    useEffect(() => {
        // If the user is onboarded already, we can redirect them to the log
        if (initialisationComplete) {
            history.push('/timeline');
        }
        
        // If not, redirect to onboarding
        history.push('/onboarding');
    }, []);

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
                    <Route path="/graph/:datumId?">
                        <Graph />
                    </Route>
                    <Route path="/settings/:category?/:settingId?">
                        <Settings />
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