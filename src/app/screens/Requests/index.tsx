import React, { useCallback } from 'react';
import { List, NavigatableListEntry, PanelBottomButtons, PanelGrid, RowHeading, SplitPanel, SubHeading } from 'app/components/PanelGrid';
import Providers from 'app/utilities/Providers';
import { useParams } from 'react-router-dom';
import { RouteProps } from '../types';
import ProviderOverlay from './components/ProviderOverlay';
import getDescription from './getDescription';
import styled from 'styled-components';
import Button from 'app/components/Button';
import { faSync } from 'app/assets/fa-light';
import { useAccounts } from 'app/store/requests/selectors';
import { State, useAppDispatch } from 'app/store';
import { useSelector } from 'react-redux';
import { refreshRequests } from 'app/store/requests/actions';
import NewAccountModal from './components/NewAccountModal';

const StatusDescription = styled.span`
    font-size: 12px;
    opacity: 0.5;
`;

const Rows = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 1.5;
`;

function Requests(): JSX.Element {
    const dispatch = useAppDispatch();
    const isLoadingRefresh = useSelector((state: State) => state.requests.isLoading.refresh);
    const { accounts, map } = useAccounts();
    const { provider: selectedProvider } = useParams<RouteProps['requests']>();

    // Callback for refreshing all requests
    const refresh = useCallback(() => dispatch(refreshRequests()), [dispatch]);

    return (
        <PanelGrid columns={2}>
            <SplitPanel>
                <List>
                    <RowHeading>Your Accounts</RowHeading>
                    <SubHeading>Automated Requests</SubHeading>
                    {accounts.map(account => 
                        <NavigatableListEntry
                            key={account}
                            to={`/requests/${account}`}
                            icon={Providers.getIcon(map[account].provider)}
                            large
                        >
                            <Rows>
                                <span>{map[account].account}</span>
                                <StatusDescription>{getDescription(map[account].status)}</StatusDescription>
                            </Rows>
                        </NavigatableListEntry>
                    )}
                    <SubHeading>Email-based Requests</SubHeading>
                </List>
                <PanelBottomButtons>
                    <NewAccountModal />
                    <Button fullWidth icon={faSync} loading={isLoadingRefresh} onClick={refresh}>
                        Refresh requests
                    </Button>
                </PanelBottomButtons>
            </SplitPanel>
            <List>
                <ProviderOverlay selectedProvider={selectedProvider} status={map[selectedProvider].status} />
            </List>
        </PanelGrid>
    )
}

export default Requests;