import React, { Component } from 'react';
import Loading from 'app/components/Loading';
import { DataRequestStatus, ProviderEvents } from 'main/providers/types';
import Providers from 'app/utilities/Providers';
import styled from 'styled-components';

interface State {
    dataRequests?: Map<string, DataRequestStatus>
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 12px;
    opacity: 0.5;
`

const Request = styled.div`
    display: flex;
    flex-direction: column;
`;

class Requests extends Component<{}, State> {
    state: State = {
        dataRequests: null,
    };

    componentDidMount(): void {
        // Subscribe to the providers' events
        window.api.on('providers', this.handleEvent);

        // And also retrieve the status of any data requests
        this.retriveDataRequests();
    }

    async retriveDataRequests(): Promise<void> {
        const dataRequests = await Providers.getDataRequests();
        console.log('DATA REQUESTS', dataRequests);
        this.setState({ dataRequests });
    }

    handleEvent = (event: Event, type: ProviderEvents): void => {
        if (type === ProviderEvents.DATA_REQUEST_COMPLETED) {
            this.retriveDataRequests();
        }
    }

    render(): JSX.Element {
        const { dataRequests } = this.state;
        console.log(dataRequests);

        if (!dataRequests) {
            return <Loading />
        }

        return (
            <Container>
                {Array.from(dataRequests.keys()).map(key => {
                    const status = dataRequests.get(key);

                    return (
                        <Request key={key}>
                            <span>Key: {key}</span>
                            <span>Dispatched: {status.dispatched.toString()}</span>
                            {status.lastCheck && <span>Last Updated: {status.lastCheck.toString()}</span>}
                            {status.completed && <span>Completed: {status.completed.toString()}</span>}
                        </Request>
                    );
                })}
                {!dataRequests.size && 
                    <div>No dispatched requests</div>
                }
            </Container>
        );
    }
}

export default Requests;