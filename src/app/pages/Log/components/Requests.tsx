import React, { Component } from 'react';
import Loading from 'app/components/Loading';
import { DataRequestStatus } from 'main/providers/types';
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

    async componentDidMount(): Promise<void> {
        const dataRequests = await Providers.getDataRequests();
        console.log('DATA REQUESTS', dataRequests);
        this.setState({ dataRequests });
    }

    render(): JSX.Element {
        const { dataRequests } = this.state;

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
                            <span>Dispatched: {status.dispatched}</span>
                            {status.lastCheck && <span>Last Updated: {status.lastCheck}</span>}
                            {status.completed && <span>Completed: {status.completed}</span>}
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