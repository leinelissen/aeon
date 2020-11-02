import React from 'react';
import { List, NavigatableListEntry, PanelGrid, RowHeading, SubHeading } from 'app/components/PanelGrid';
import useRequests from 'app/utilities/useRequests';
import Loading from 'app/components/Loading';
import Providers from 'app/utilities/Providers';
import { useParams } from 'react-router-dom';
import { RouteProps } from '../types';
import ProviderOverlay from './components/ProviderOverlay';
import getDescription from './getDescription';
import styled from 'styled-components';

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
    const requests = useRequests();
    const { provider: selectedProvider } = useParams<RouteProps['requests']>();
    
    if (!requests) {
        return <Loading />;
    }
    
    // Destructure the data
    const { providers, dispatched } = requests;
    console.log(requests);

    return (
        <PanelGrid columns={2}>
            <List>
                <RowHeading>Your Accounts</RowHeading>
                <SubHeading>Automated Requests</SubHeading>
                {providers.map(provider => 
                    <NavigatableListEntry
                        key={provider}
                        to={`/requests/${provider}`}
                        icon={Providers.getIcon(provider)}
                        active={selectedProvider === provider}
                        large
                    >
                        <Rows>
                            <span>{provider}</span>
                            <StatusDescription>{getDescription(dispatched.get(provider))}</StatusDescription>
                        </Rows>
                    </NavigatableListEntry>
                )}
                <SubHeading>Email-based Requests</SubHeading>
            </List>
            <List>
                <ProviderOverlay selectedProvider={selectedProvider} status={dispatched.get(selectedProvider)} />
            </List>
        </PanelGrid>
    )
}

export default Requests;