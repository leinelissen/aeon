import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Onboarding from './Onboarding';
import Timeline from './Timeline';
import Data from './Data';
import Store from 'app/store';
import AnimatedSwitch from 'app/utilities/AnimatedSwitch';
import Menu, { MenuContainer, TitleBar } from 'app/components/Menu';

/**
 * A helper to determine what the starting screen should be for the application.
 */
function initialiseRoute(): JSX.Element {
    const store = Store.useStore();

    // If the user is onboarded already, we can redirect them to the log
    if (store.get('onboardingComplete').initialisation) {
        return <Redirect to='/timeline' exact />;
    }
    
    // If not, redirect to onboarding
    return <Redirect to='/onboarding' exact />;
}

function Router(): JSX.Element {
    return (
        <MenuContainer>
            <TitleBar />
            <Menu />
            <AnimatedSwitch>
                <Route path='/timeline' component={Timeline} />
                <Route path='/onboarding' exact component={Onboarding} />
                <Route path="/data" component={Data} />
                <Route path="/" component={initialiseRoute} />
            </AnimatedSwitch>
        </MenuContainer>
    );
}

export default Router;