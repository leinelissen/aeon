import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlarmExclamation, faCheck, faClock, faLink, faPlus, faQuestion, faUpload } from 'app/assets/fa-light';
import faOpenDataRights from 'app/assets/open-data-rights';
import Button from 'app/components/Button';
import RightSideOverlay, { Section } from 'app/components/RightSideOverlay';
import { H2 } from 'app/components/Typography';
import { State, useAppDispatch } from 'app/store';
import { dispatchEmailRequest } from 'app/store/accounts/actions';
import { EmailProvider } from 'app/store/accounts/types';
import Providers from 'app/utilities/Providers';
import { formatDistanceToNow } from 'date-fns';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
    selectedAccount: string;
}

function AccountOverlay({ selectedAccount }: Props): JSX.Element {
    const dispatch = useAppDispatch();
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
        if (account.provider === 'email') {
            // If the provider is of email type, we just dispatch directly to
            // the store
            dispatch(dispatchEmailRequest(selectedAccount.split('email_')[1]));
        } else {
            // If not, we dispatch to the backend and have the back-end deal
            // with it
            setLoading(true);
            await Providers.dispatchDataRequest(selectedAccount).catch(() => null);
            setLoading(false);
        }
    }, [selectedAccount, dispatch, setLoading]);

    return (
        <RightSideOverlay data-tour="accounts-account-overlay">
            {selectedAccount && (
                <>
                    <Section>
                        <H2>
                            <FontAwesomeIcon
                                icon={Providers.getIcon(account.provider)}
                                style={{ marginRight: 8 }}
                            />
                            {account.account}
                        </H2>
                    </Section>
                    <Section>
                        <span>
                            {account.url && 
                                <>
                                    <FontAwesomeIcon
                                        icon={faOpenDataRights}
                                        style={{ marginRight: 8 }}
                                        fixedWidth
                                    />
                                    Open Data Rights API-based
                                    <br />
                                    <FontAwesomeIcon
                                        icon={faLink}
                                        style={{ marginRight: 8 }}
                                        fixedWidth
                                    />
                                    Host: <i>{account.url}</i>
                                    <br />
                                    
                                </>
                            }
                            <FontAwesomeIcon
                                icon={faQuestion}
                                style={{ marginRight: 8 }}
                                fixedWidth
                            />
                            Data requested: <i>{account.status?.dispatched ? formatDistanceToNow(new Date(account.status.dispatched)) + ' ago' : 'never'}</i>
                            <br />
                            <FontAwesomeIcon
                                icon={faClock}
                                style={{ marginRight: 8 }}
                                fixedWidth
                            />
                            Last check: <i>{account.status?.lastCheck ? formatDistanceToNow(new Date(account.status.lastCheck)) + ' ago' : 'never'}</i>
                            {account.status?.completed && 
                                <>
                                    <br />
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        style={{ marginRight: 8 }}
                                        fixedWidth
                                    />
                                    Completed: <i>{formatDistanceToNow(new Date(account.status?.completed))} ago</i>
                                </>
                            }
                        </span>
                    </Section>
                    {account.status?.dispatched ? 
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
                                        <Button icon={faAlarmExclamation} disabled fullWidth>
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
                            <Button
                                fullWidth
                                icon={faPlus}
                                onClick={handleNewRequest}
                                disabled={!!account.status?.dispatched}
                                loading={isLoading}
                            >
                                Start Data Request
                            </Button>
                        </Section>
                    }
                </>
            )}
        </RightSideOverlay>
    );
}

export default AccountOverlay;