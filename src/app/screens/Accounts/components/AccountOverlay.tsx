import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faClock, faLink, faPlus, faQuestion, faUpload } from '@fortawesome/free-solid-svg-icons';
import faOpenDataRights from 'app/assets/open-data-rights';
import Button, { GhostButton } from 'app/components/Button';
import RightSideOverlay, { DetailListItem, Section } from 'app/components/RightSideOverlay';
import { FontLarge, H2 } from 'app/components/Typography';
import { State, useAppDispatch } from 'app/store';
import { dispatchEmailRequest } from 'app/store/accounts/actions';
import { EmailProvider } from 'app/store/accounts/types';
import Providers from 'app/utilities/Providers';
import { InitialisedAccount } from 'main/providers/types';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import IconBadge from 'app/components/IconBadge';
import { PullContainer } from 'app/components/Utility';
import Timestamp from 'app/components/Timestamp';

interface Props {
    selectedAccount: string;
}

function hasUrl(account: InitialisedAccount | EmailProvider): account is InitialisedAccount {
    return 'url' in (account as InitialisedAccount);
}

function AccountOverlay({ selectedAccount }: Props): JSX.Element {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const account = useSelector((state: State) => {
        if (!selectedAccount) {
            return;
        }

        return selectedAccount.startsWith('email_')
            ? state.accounts.emailProviders.byKey[selectedAccount.split('email_')[1]]
            : state.accounts.byKey[selectedAccount]
    });
    const [isLoading, setLoading] = useState(false);

    // Handle a request for a new request
    const handleNewRequest = useCallback(async () => {
        // If the provider is of email type, we just dispatch directly to
        // the store.
        if (account.provider === 'email') {
            // Add some arbitrary delay
            setLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            dispatch(dispatchEmailRequest(selectedAccount.split('email_')[1]));
            setLoading(false);
        } else {
            // If not, we dispatch to the backend and have the back-end deal
            // with it
            setLoading(true);
            await Providers.dispatchDataRequest(selectedAccount).catch(() => null);
            setLoading(false);
        }
    }, [selectedAccount, dispatch, setLoading]);

    const handleClose = useCallback(() => {
        navigate('/accounts');
    }, [navigate]);

    // GUARD: If there is no account data available (sometimes the data hasn't
    // yet been retrieved from the back-end), don't render anything.
    if (!account) {
        return null;
    }

    return (
        <RightSideOverlay data-tour="accounts-account-overlay" onClose={handleClose}>
            {selectedAccount && (
                <>
                    <Section>
                        <PullContainer>
                            <IconBadge icon={Providers.getIcon(account.provider)} />
                            <H2>{account.account}</H2>
                        </PullContainer>
                    </Section>
                    <Section well>
                        <FontLarge>
                            {hasUrl(account) && 
                                <>
                                    <DetailListItem>
                                        <span>
                                            <FontAwesomeIcon
                                                icon={faOpenDataRights}
                                                fixedWidth
                                            />
                                        </span>
                                        <span>Open Data Rights API-based</span>
                                    </DetailListItem>
                                    <DetailListItem>
                                        <span>
                                            <FontAwesomeIcon
                                                icon={faLink}
                                                fixedWidth
                                            />
                                        </span>
                                        <span>Host: {account.url}</span>
                                    </DetailListItem>
                                </>
                            }
                            <DetailListItem>
                                <span>
                                    <FontAwesomeIcon
                                        icon={faQuestion}
                                        fixedWidth
                                    />
                                </span>
                                <span>Data requested: <Timestamp>{account.status?.dispatched}</Timestamp></span>
                            </DetailListItem>
                            <DetailListItem>
                                <span>
                                    <FontAwesomeIcon
                                        icon={faClock}
                                        fixedWidth
                                    />
                                </span>
                                <span>
                                    Last check: <Timestamp>{account.status.lastCheck}</Timestamp>
                                </span>
                            </DetailListItem>
                            {account.status?.completed && 
                                <DetailListItem>
                                    <span>
                                        <FontAwesomeIcon
                                            icon={faCheck}
                                            fixedWidth
                                        />
                                    </span>
                                    <span>Completed: <Timestamp>{account.status?.completed}</Timestamp></span>
                                </DetailListItem>
                            }
                        </FontLarge>
                    </Section>
                    {account.status?.dispatched && !account.status.completed ? 
                        <Section>
                            <p>The data request you issued has not been completed yet. We&apos;ll let you know as soon as it&apos;s completed. We&apos;ll notify you if the request exceeds the legal limit of thirty days.</p>
                            {account.provider !== 'email'
                                ? (
                                    <Button
                                        fullWidth
                                        icon={faCheck}
                                        onClick={handleNewRequest}
                                        disabled
                                    >
                                        Complete Data Request
                                    </Button>
                                ) : (
                                    <>
                                        <Button icon={faUpload} fullWidth>
                                            Upload archive
                                        </Button>
                                        <Button icon={faBell} disabled fullWidth>
                                            Send reminder
                                        </Button>
                                    </>
                                )
                            }
                        </Section>
                        : 
                        <Section data-tour="accounts-start-data-request">
                            <p>If you would like to retrieve your data, use the button below to start a new data request.</p>
                            {account.provider !== 'email'
                                ? <p>When you click the button, a new window will appear, in which you will asked to enter your credentials. Aeon does not store any of your credentials. Rather, the window is used to perform actions on your behalf.</p>
                                : <p>When you click the button, we will send out an email on your behalf on the account {(account as EmailProvider).emailAccount}. You have to check if the request is completed yourself, and then upload the resulting archive here.</p>
                            }
                            <GhostButton
                                fullWidth
                                icon={faPlus}
                                onClick={handleNewRequest}
                                disabled={account.status?.dispatched && !account.status.completed}
                                loading={isLoading}
                            >
                                Start Data Request
                            </GhostButton>
                        </Section>
                    }
                </>
            )}
        </RightSideOverlay>
    );
}

export default AccountOverlay;