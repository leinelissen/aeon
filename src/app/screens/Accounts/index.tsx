import React, { useCallback } from 'react';
import { Category, List, NavigatableListEntry, PanelBottomButtons, PanelGrid, RowHeading, SplitPanel } from 'app/components/PanelGrid';
import Providers from 'app/utilities/Providers';
import { useParams } from 'react-router-dom';
import { RouteProps } from '../types';
import AccountOverlay from './components/AccountOverlay';
import getDescription from './getDescription';
import styled from 'styled-components';
import Button from 'app/components/Button';
import { faEnvelope, faSync } from 'app/assets/fa-light';
import { useAccounts } from 'app/store/accounts/selectors';
import { State, useAppDispatch } from 'app/store';
import { useSelector } from 'react-redux';
import { refreshRequests } from 'app/store/accounts/actions';
import NewAccountModal from './components/NewAccountModal';
import useTour from 'app/components/Tour/useTour';

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
    const { accounts, map, email } = useAccounts();
    const { account: selectedAccount } = useParams<RouteProps['requests']>();

    // Callback for refreshing all requests
    const refresh = useCallback(() => dispatch(refreshRequests()), [dispatch]);

    useTour(accounts.length ? '/screen/accounts/has-accounts': '/screen/accounts/no-accounts');

    return (
        <>
            <PanelGrid columns={2}>
                <SplitPanel>
                    <List>
                        <RowHeading>Your Accounts</RowHeading>
                        <Category title="Automated Requests" id="automated-accounts">
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
                        </Category>
                        <Category title="Email-based Requests" id="email-accounts">
                            {email.all.map(account => (
                                <NavigatableListEntry
                                    key={account}
                                    to={`/accounts/email_${account}`}
                                    icon={faEnvelope}
                                    large
                                >
                                    <Rows>
                                        <span>{email.byKey[account].organisation} ({email.byKey[account].emailAccount})</span>
                                        <StatusDescription>{getDescription(email.byKey[account].status)}</StatusDescription>
                                    </Rows>
                                </NavigatableListEntry>
                            ))}
                        </Category>
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
        </>
    )
}

export default Accounts;