import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClock, faPlus, faQuestion, faSync } from 'app/assets/fa-light';
import Button from 'app/components/Button';
import RightSideOverlay, { Section } from 'app/components/RightSideOverlay';
import { H2 } from 'app/components/Typography';
import Providers from 'app/utilities/Providers';
import { formatDistanceToNow } from 'date-fns';
import { DataRequestStatus } from 'main/providers/types';
import React, { useCallback } from 'react';

interface Props {
    selectedProvider: string;
    status?: DataRequestStatus;
}

function ProviderOverlay({ selectedProvider, status }: Props): JSX.Element {
    const handleNewRequest = useCallback(() => {
        Providers.dispatchDataRequest(selectedProvider);
    }, [selectedProvider]);

    return (
        <RightSideOverlay>
            {selectedProvider && (
                <>
                    <Section>
                        <H2>
                            <FontAwesomeIcon
                                icon={Providers.getIcon(selectedProvider)}
                                style={{ marginRight: 8 }}
                            />
                            {selectedProvider}
                        </H2>
                    </Section>
                    <Section>
                        <span>
                            <FontAwesomeIcon
                                icon={faQuestion}
                                style={{ marginRight: 8 }}
                                fixedWidth
                            />
                            Data requested: <i>{status?.dispatched ? formatDistanceToNow(status.dispatched) + ' ago' : 'never'}</i>
                            <br />
                            <FontAwesomeIcon
                                icon={faClock}
                                style={{ marginRight: 8 }}
                                fixedWidth
                            />
                            Last check: <i>{status?.lastCheck ? formatDistanceToNow(status.lastCheck) + ' ago' : 'never'}</i>
                            {status?.completed && 
                                <>
                                    <br />
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        style={{ marginRight: 8 }}
                                        fixedWidth
                                    />
                                    Completed: <i>{formatDistanceToNow(status?.completed)} ago</i>
                                </>
                            }
                        </span>
                    </Section>
                    {status?.dispatched ? 
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
                        <Section>
                            <p>If you would like to retrieve your data, use the button below to start a new data request.</p>
                            <p><i>Note: you may be asked to confirm your password</i></p>
                            <Button
                                fullWidth
                                icon={faPlus}
                                onClick={handleNewRequest}
                                disabled={!!status?.dispatched}
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

export default ProviderOverlay;