import React, { Component, useCallback, PropsWithChildren } from 'react';
import Loading, { Ball } from 'app/components/Loading';
import { DataRequestStatus, ProviderEvents } from 'main/providers/types';
import Providers from 'app/utilities/Providers';
import styled, { css } from 'styled-components';
import theme from 'app/styles/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HoverArea, Tooltip, TooltipContainer } from 'app/components/Tooltip';
import { SimpleButton } from 'app/components/Button';
import { formatDistanceToNow } from 'date-fns';

interface State {
    dataRequests?: Map<string, DataRequestStatus>,
    lastChecked?: Date,
    checking: boolean,
    providers: string[],
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    font-size: 12px;
    border-top: 1px solid #eee;
    border-right: 1px solid #eee;
`

const Request = styled.div<{ color?: string; }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    width: 48px;
    height: 48px;
    margin-left: auto;
    border-right: 1px solid #eee;
    border-bottom: 5px solid ${props => props.color || 'transparent'};

    &:hover {
        background-color: #eee;
        opacity: 1;
    }
`;

const LastCheck = styled.div<{ readonly isLoading: boolean }>`
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-right: 8px;
    ${props => !props.isLoading && css`
        opacity: 0.2;

        &:hover {
            opacity: 0.6;
        }
    `}
`;

interface ClickableRequestProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onClick'> {
    provider?: string;
    onClick: (provider?: string) => void;
}

function ClickableRequest(props: PropsWithChildren<ClickableRequestProps>): JSX.Element {
    const handleClick = useCallback(() => {
        return props.onClick(props.provider);
    }, [props.onClick, props.provider]);

    return (
        <SimpleButton onClick={handleClick}>
            {props.children}
        </SimpleButton>
    );
}

class Requests extends Component<unknown, State> {
    state: State = {
        dataRequests: null,
        checking: false,
        providers: [],
    };

    componentDidMount(): void {
        // Subscribe to the providers' events
        Providers.subscribe(this.handleEvent);

        // And also retrieve the status of any data requests
        this.retriveDataRequests();
    }

    componentWillUnmount(): void {
        Providers.unsubscribe(this.handleEvent);
    }

    async retriveDataRequests(): Promise<void> {
        const { dispatched: dataRequests, providers, lastChecked } = await Providers.getDataRequests();
        this.setState({ dataRequests, providers, lastChecked });
    }

    handleEvent = (event: Event, type: ProviderEvents): void => {
        if (type === ProviderEvents.DATA_REQUEST_COMPLETED) {
            this.retriveDataRequests();
            this.setState({ checking: false });
        } else if (type === ProviderEvents.CHECKING_DATA_REQUESTS) {
            this.setState({ checking: true });
        } else if (type === ProviderEvents.DATA_REQUEST_DISPATCHED) {
            this.retriveDataRequests();
        }
    }

    getColor(status?: DataRequestStatus): string {
        if (!status) {
            return theme.colors.grey.medium;
        }

        const { dispatched, completed } = status;

        if (dispatched && completed) {
            return theme.colors.green;
        }

        if (dispatched && !completed) {
            return theme.colors.yellow;
        }

        if (!dispatched) {
            return theme.colors.grey.medium;
        }
    }

    handleRefresh = (): void => {
        Providers.refresh();
    }

    handleRequestForRequest = (key: string): void => {
        const status = this.state.dataRequests.get(key);
        
        if (!status) {
            Providers.dispatchDataRequest(key).catch(null);
        } else if (status?.dispatched) {
            this.handleRefresh();
        } 
    }

    updateRegularRequests = (): void => {
        Providers.updateAll();
    }

    render(): JSX.Element {
        const { dataRequests, lastChecked, checking, providers } = this.state;

        if (!dataRequests) {
            return <Loading />
        }

        return (
            <Container>
                {providers.map(key => {
                    const status = dataRequests.get(key);

                    return (
                        <TooltipContainer key={key}>
                            {({ handleChange, isHovered }) => (
                                <>
                                    <HoverArea onChange={handleChange}>
                                        <ClickableRequest provider={key} onClick={this.handleRequestForRequest} data-telemetry-id="dispatch-provider">
                                            <Request color={this.getColor(status)}>
                                                <FontAwesomeIcon icon={Providers.getIcon(key)} />
                                            </Request>
                                        </ClickableRequest>
                                    </HoverArea>
                                    <Tooltip placement="top" active={isHovered}>
                                        <>
                                            {status?.dispatched
                                                ? `A datarequest for ${key} was sent out ${formatDistanceToNow(status.dispatched)} ago.`
                                                : undefined
                                            }
                                            {status?.completed
                                                ? `It was completed ${formatDistanceToNow(status.completed)} ago.`
                                                : undefined
                                            }
                                        </>
                                    </Tooltip>
                                </>
                            )}
                        </TooltipContainer>
                    );
                })}
                <LastCheck isLoading={checking}>
                    {checking ? (
                        <Ball size={10} />
                    ) : lastChecked && (
                        <SimpleButton onClick={this.handleRefresh} data-telemetry-id="refresh-requests">
                            Last check: {formatDistanceToNow(lastChecked)} ago
                        </SimpleButton>
                    )}
                </LastCheck>
            </Container>
        );
    }
}

export default Requests;