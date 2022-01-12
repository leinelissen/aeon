import React from 'react';
import { Route, Routes } from 'react-router-dom';
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
            <ContentContainer id="content">
                <TitleBar />
                <Routes>
                    <Route path="/timeline">
                        <Route index element={<Timeline />} />
                        <Route path=":commitHash" element={<Timeline />} />
                    </Route>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/accounts">
                        <Route index element={<Accounts />} />
                        <Route path=":account" element={<Accounts />} />
                    </Route>
                    <Route path="/data">
                        <Route index element={<Data />} />
                        <Route path=":category" element={<Data />} />
                        <Route path=":category/:datumId" element={<Data />} />
                    </Route>
                    <Route path="/graph">
                        <Route index element={<Graph />} />
                        <Route path=":datumId" element={<Graph />} />
                    </Route>
                    <Route path="/settings">
                        <Route index element={<Settings />} />
                        <Route path=":category" element={<Settings />} />
                        <Route path=":category/:settingId" element={<Settings />} />
                    </Route>
                    <Route path="/erasure">
                        <Route index element={<Erasure />} />
                        <Route path="emails" element={<ErasureEmails />} />
                    </Route>
                    <Route path="/" element={<Onboarding />} />
                </Routes>
            </ContentContainer>
        </MenuContainer>
    );
}

export default Router;