import React, { Component, FunctionComponent, useCallback } from 'react';
import Loading, { Ball } from 'app/components/Loading';
import { DataRequestStatus, ProviderEvents } from 'main/providers/types';
import Providers from 'app/utilities/Providers';
import styled, { css } from 'styled-components';
import theme from 'app/styles/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Repository from 'app/utilities/Repository';
import { HoverArea, Tooltip, TooltipContainer } from 'app/components/Tooltip';
import { formatDistanceToNow } from 'date-fns';
import { LinkButton } from 'app/components/Button';

interface State {
    dataRequests?: Map<string, DataRequestStatus>,
    lastCheck?: Date,
    checking: boolean,
}

const Container = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    font-size: 12px;
    border-top: 1px solid #eee;
    width: 100%;
    background-color: white;
`

const Request = styled.div<{ color: string; }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    width: 48px;
    height: 48px;
    margin-left: auto;
    border-right: 1px solid #eee;
    border-bottom: 5px solid ${props => props.color};
    opacity: 0.5;

    &:hover {
        background-color: #eee;
        opacity: 1;
    }
`;

const LastCheck = styled.div<{ loading: boolean }>`
    display: flex;
    align-items: center;
    margin-left: auto;
    margin-right: 8px;
    ${props => !props.loading && css`
        opacity: 0.2;

        &:hover {
            opacity: 0.6;
        }
    `}
`;

interface ClickableRequestProps {
    key: string;
    onClick: (key: string) => void;
}

const ClickableRequest: FunctionComponent<ClickableRequestProps> = (props): JSX.Element => {
    const handleClick = useCallback(() => {
        return props.onClick(props.key);
    }, [props.onClick, props.key]);

    return (
        <LinkButton onClick={handleClick}>
            {props.children}
        </LinkButton>
    );
}

class Requests extends Component<{}, State> {
    state: State = {
        dataRequests: null,
        checking: false,
    };

    componentDidMount(): void {
        // Subscribe to the providers' events
        window.api.on('providers', this.handleEvent);

        // And also retrieve the status of any data requests
        this.retriveDataRequests();
    }

    async retriveDataRequests(): Promise<void> {
        const [dataRequests, lastCheck] = await Providers.getDataRequests();
        this.setState({ dataRequests, lastCheck });
    }

    handleEvent = (event: Event, type: ProviderEvents): void => {
        if (type === ProviderEvents.DATA_REQUEST_COMPLETED) {
            this.retriveDataRequests();
            this.setState({ checking: false });
        } else if (type === ProviderEvents.CHECKING_DATA_REQUESTS) {
            this.setState({ checking: true });
        }
    }

    getColor(status: DataRequestStatus): string {
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

    handleUpdateDataRequests = (): void => {
        Providers.refreshDataRequests();
    }

    handleRequestForRequest = (key: string): void => {
        Providers.dispatchDataRequest(key);
    }

    render(): JSX.Element {
        const { dataRequests, lastCheck, checking } = this.state;

        if (!dataRequests) {
            return <Loading />
        }

        return (
            <Container>
                {Array.from(dataRequests.keys()).map(key => {
                    const status = dataRequests.get(key);

                    return (
                        <TooltipContainer key={key}>
                            {({ handleChange, isHovered }) => (
                                <>
                                    <HoverArea onChange={handleChange}>
                                        <ClickableRequest key={key} onClick={this.handleRequestForRequest}>
                                            <Request key={key} color={this.getColor(status)}>
                                                <FontAwesomeIcon icon={Repository.getIcon(key)} />
                                            </Request>
                                        </ClickableRequest>
                                    </HoverArea>
                                    <Tooltip placement="top" active={isHovered}>
                                    <>
                                        A datarequest for {key} was sent out {formatDistanceToNow(status.dispatched)} ago.
                                        It was completed {formatDistanceToNow(status.completed)} ago.
                                    </>
                                    </Tooltip>
                                </>
                            )}
                        </TooltipContainer>
                    );
                })}
                <LastCheck loading={checking}>
                    {checking ? (
                        <Ball size={10} />
                    ) : lastCheck && (
                        <LinkButton onClick={this.handleUpdateDataRequests}>
                            Last check: {formatDistanceToNow(lastCheck)} ago
                        </LinkButton>
                    )}
                </LastCheck>
                {!dataRequests.size && 
                    <div>No dispatched requests</div>
                }
            </Container>
        );
    }
}

export default Requests;