import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Menu, { ContentContainer, MenuContainer, TitleBar } from 'app/components/Menu';
import Onboarding from './Onboarding';
import Timeline from './Timeline';
import Data from './Data';
import Accounts from './Accounts';
import Settings from './Settings';
import Graph from './Graph';
import Erasure from './Erasure';
import ErasureEmails from './Erasure/Emails';

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
                    <Route path="/accounts/:account?">
                        <Accounts />
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
                    <Route exact path="/erasure">
                        <Erasure />
                    </Route>
                    <Route path="/erasure/emails">
                        <ErasureEmails />
                    </Route>
                    <Route exact path="/">
                        <Onboarding />
                    </Route>
                </Switch>
            </ContentContainer>
        </MenuContainer>
    );
}

export default Router;