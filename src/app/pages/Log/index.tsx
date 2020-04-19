import React, { Component } from 'react';
import Repository from 'app/utilities/Repository';
import { ReadCommitResult } from 'isomorphic-git';
import styled from 'styled-components';
import Commit, { StyledCommit } from './components/Commit';
import Diff from './components/Diff';
import Loading from 'app/components/Loading';
import Button from 'app/components/Button';
import Providers from 'app/utilities/Providers';
import { faSync } from '@fortawesome/pro-light-svg-icons';
import Requests from './components/Requests';
import { Link } from 'react-router-dom';
import { TransitionDirection } from 'app/utilities/AnimatedSwitch';

interface State {
    log: ReadCommitResult[];
    selectedCommit?: string;
    updating: boolean;
}

const Container = styled.div`
    display: flex;
    background: white;

    & > * {
        overflow-y: scroll;
        height: calc(100vh - 40px);
    }
`;

const CommitContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    border-right: 1px solid #eee;
    width: 66vw;
`;

class Log extends Component<{}, State> {
    state: State = {
        log: [],
        selectedCommit: null,
        updating: false,
    };

    componentDidMount(): void {
        this.fetchLog();
    }

    fetchLog = (): Promise<void> => {
        return Repository.log()
            .then(log => this.setState({ 
                log, 
                selectedCommit: this.state.selectedCommit || log[0].oid 
            }));
    }

    handleClick = (hash: string): void => {
        this.setState({ selectedCommit: hash });
    }

    handleRefresh = async (): Promise<void> => {
        this.setState({ updating: true });
        await Providers.refreshDataRequests();
        this.setState({ updating: false });
        this.fetchLog();
    }

    handleDispatch = async (): Promise<void> => {
        this.setState({ updating: true });
        await Providers.dispatchDataRequest('instagram');
        this.setState({ updating: false });
        this.fetchLog();
    }

    render(): JSX.Element {
        const { log, selectedCommit, updating } = this.state;

        if (!log.length) {
            return <Loading />;
        }

        return (
            <Container>
                <CommitContainer>
                    <Link to={`/commit/new?transition=${TransitionDirection.right}`}>
                        <StyledCommit active={false}>
                            Create a new commit
                        </StyledCommit>
                    </Link>
                    {log.map((entry: ReadCommitResult) => (
                        <Commit key={entry.oid} entry={entry} onClick={this.handleClick} active={entry.oid === selectedCommit} />
                    ))}
                    <Requests />
                </CommitContainer>
                <Diff commit={selectedCommit} />
            </Container>
        );
    }
}

export default Log;