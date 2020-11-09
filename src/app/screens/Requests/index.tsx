import React, { useCallback } from 'react';
import { List, NavigatableListEntry, PanelBottomButtons, PanelGrid, RowHeading, SplitPanel, SubHeading } from 'app/components/PanelGrid';
import Loading from 'app/components/Loading';
import Providers from 'app/utilities/Providers';
import { useParams } from 'react-router-dom';
import { RouteProps } from '../types';
import ProviderOverlay from './components/ProviderOverlay';
import getDescription from './getDescription';
import styled from 'styled-components';
import Button from 'app/components/Button';
import { faSync } from 'app/assets/fa-light';
import { useRequests } from 'app/store/requests/selectors';
import { State, useAppDispatch } from 'app/store';
import { useSelector } from 'react-redux';
import { refreshRequests } from 'app/store/requests/actions';

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
    const { providers, map } = useRequests();
    const { provider: selectedProvider } = useParams<RouteProps['requests']>();

    // Callback for refreshing all requests
    const refresh = useCallback(() => dispatch(refreshRequests()), [dispatch]);

    return (
        <PanelGrid columns={2}>
            <SplitPanel>
                <List>
                    <RowHeading>Your Accounts</RowHeading>
                    <SubHeading>Automated Requests</SubHeading>
                    {providers.map(provider => 
                        <NavigatableListEntry
                            key={provider}
                            to={`/requests/${provider}`}
                            icon={Providers.getIcon(provider)}
                            large
                        >
                            <Rows>
                                <span>{provider}</span>
                                <StatusDescription>{getDescription(map[provider])}</StatusDescription>
                            </Rows>
                        </NavigatableListEntry>
                    )}
                    <SubHeading>Email-based Requests</SubHeading>
                </List>
                <PanelBottomButtons>
                    <Button fullWidth icon={faSync} loading={isLoadingRefresh} onClick={refresh}>
                        Refresh requests
                    </Button>
                </PanelBottomButtons>
            </SplitPanel>
            <List>
                <ProviderOverlay selectedProvider={selectedProvider} status={map[selectedProvider]} />
            </List>
        </PanelGrid>
    )
}

export default Requests;