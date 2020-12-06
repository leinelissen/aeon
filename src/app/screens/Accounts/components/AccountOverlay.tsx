import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClock, faLink, faPlus, faQuestion } from 'app/assets/fa-light';
import faOpenDataRights from 'app/assets/open-data-rights';
import Button from 'app/components/Button';
import RightSideOverlay, { Section } from 'app/components/RightSideOverlay';
import { H2 } from 'app/components/Typography';
import { State } from 'app/store';
import Providers from 'app/utilities/Providers';
import { formatDistanceToNow } from 'date-fns';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
    selectedAccount: string;
}

function AccountOverlay({ selectedAccount }: Props): JSX.Element {
    const account = useSelector((state: State) => state.accounts.byKey[selectedAccount]);
    const [isLoading, setLoading] = useState(false);
    const handleNewRequest = useCallback(async () => {
        setLoading(true);
        await Providers.dispatchDataRequest(selectedAccount).catch(() => null);
        setLoading(false);
    }, [selectedAccount]);

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
                            <p>The data request you issued has not been completed yet. We&apos;ll let you know as soon as it&apos;s completed.</p>
                            <Button
                                fullWidth
                                icon={faCheck}
                                onClick={handleNewRequest}
                                disabled
                            >
                                Complete Data Request
                            </Button>
                        </Section>
                        : 
                        <Section data-tour="accounts-start-data-request">
                            <p>If you would like to retrieve your data, use the button below to start a new data request.</p>
                            <p>When you click the button, a new window will appear, in which you will asked to enter your credentials. Aeon does not store any of your credentials. Rather, the window is used to perform actions on your behalf.</p>
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