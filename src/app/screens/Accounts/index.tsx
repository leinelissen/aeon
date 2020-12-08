import React, { useCallback } from 'react';
import { List, NavigatableListEntry, PanelBottomButtons, PanelGrid, RowHeading, SplitPanel, SubHeading } from 'app/components/PanelGrid';
import Providers from 'app/utilities/Providers';
import { useParams } from 'react-router-dom';
import { RouteProps } from '../types';
import AccountOverlay from './components/AccountOverlay';
import getDescription from './getDescription';
import styled from 'styled-components';
import Button from 'app/components/Button';
import { faSync } from 'app/assets/fa-light';
import { useAccounts } from 'app/store/accounts/selectors';
import { State, useAppDispatch } from 'app/store';
import { useSelector } from 'react-redux';
import { refreshRequests } from 'app/store/accounts/actions';
import NewAccountModal from './components/NewAccountModal';
import Tour from 'app/components/Tour';

const StatusDescription = styled.span`
    font-size: 12px;
    opacity: 0.5;
`;

const Rows = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 1.5;
`;

function Accounts(): JSX.Element {
    const dispatch = useAppDispatch();
    const isLoadingRefresh = useSelector((state: State) => state.accounts.isLoading.refresh);
    const { accounts, map } = useAccounts();
    const { account: selectedAccount } = useParams<RouteProps['requests']>();

    // Callback for refreshing all requests
    const refresh = useCallback(() => dispatch(refreshRequests()), [dispatch]);

    return (
        <>
            <PanelGrid columns={2}>
                <SplitPanel>
                    <List>
                        <RowHeading>Your Accounts</RowHeading>
                        <SubHeading>Automated Requests</SubHeading>
                        {accounts.map((account, i) => 
                            <NavigatableListEntry
                                key={account}
                                to={`/accounts/${account}`}
                                icon={Providers.getIcon(map[account].provider)}
                                data-tour={i === 0 ? 'accounts-first-account' : undefined}
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
                    <AccountOverlay selectedAccount={selectedAccount} />
                </List>
            </PanelGrid>
            <Tour
                tour={accounts.length 
                    ? "/screen/accounts/has-accounts"
                    : "/screen/accounts/no-accounts"
                } 
            />
        </>
    )
}

export default Accounts;