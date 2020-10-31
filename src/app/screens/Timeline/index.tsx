import React, { Component } from 'react';
import Repository from 'app/utilities/Repository';
import styled from 'styled-components';
import Commit, { TimelineLine } from './components/Commit';
import Diff from './components/Diff';
import Loading from 'app/components/Loading';
import Providers from 'app/utilities/Providers';
import { RepositoryEvents, Commit as CommitType } from 'main/lib/repository/types';
import { IpcRendererEvent } from 'electron';
import TutorialOverlay from './components/TutorialOverlay';
import Store, { StoreProps } from 'app/store';
import { useHistory, useParams } from 'react-router-dom';
import { RouteProps } from '../types';
import { History } from 'history';

interface State {
    log: CommitType[];
    updating: boolean;
}

interface Props {
    params: RouteProps['timeline'];
    history: History;
}

const Container = styled.div`
    display: grid;
    height: 100%;
    grid-template-columns: 50% 50%;
    grid-template-areas: 
        "commits diff";
`;

const CommitContainer = styled.div`
    display: flex;
    grid-area: "commits";
    flex-direction: column;
    position: relative;
    top: 0;
    flex-shrink: 0;
    border-right: 1px solid #eee;
    overflow-y: auto;
`;

class Timeline extends Component<StoreProps & Props, State> {
    state: State = {
        log: [],
        updating: false,
    };

    componentDidMount(): void {
        this.fetchLog();
        Repository.subscribe(this.handleEvent);
    }

    componentWillUnmount(): void {
        Repository.unsubscribe(this.handleEvent);
    }

    handleEvent = (event: IpcRendererEvent, type: RepositoryEvents): void => {
        if (type === RepositoryEvents.NEW_COMMIT) {
            this.fetchLog();
        }
    }

    fetchLog = (): Promise<void> => {
        return Repository.log()
            .then(log => {
                // Save log to state
                this.setState({ log });

                // Redirect to most recent commit if none is set
                if (!this.props.params.commitHash) {
                    this.props.history.push('/timeline/' + log[0].oid);
                }
            });
    }

    handleClick = (hash: string): void => {
        this.props.history.push('/timeline/' + hash);
        // this.setState({ selectedCommit: hash });
    }

    handleRefresh = async (): Promise<void> => {
        this.setState({ updating: true });
        await Providers.refresh().catch(null);
        this.setState({ updating: false });
        this.fetchLog();
    }

    handleDispatch = async (): Promise<void> => {
        this.setState({ updating: true });
        await Providers.dispatchDataRequest('instagram').catch(null);
        this.setState({ updating: false });
        this.fetchLog();
    }

    render(): JSX.Element {
        const { log } = this.state;
        const { params: { commitHash } } = this.props;
        const newCommit = this.props.store.get('newCommit');
        const selectedTree = commitHash === 'new-commit'
            ? newCommit
            : log.find(d => d.oid === commitHash);

        if (!log.length) {
            return <Loading />;
        }

        return (
            <Container> 
                <TimelineLine />
                <CommitContainer>
                    {newCommit ? 
                        <Commit
                            entry={newCommit}
                            active={'new-commit' === commitHash}
                            onClick={this.handleClick}
                        />
                        : null}
                    {log.map((entry, i) => (
                        <Commit
                            key={entry.oid}
                            entry={entry}
                            onClick={this.handleClick}
                            active={entry.oid === commitHash}
                            latestCommit={i === 0}
                            data-telemetry-id="timeline-view-commit"
                        />
                    ))}
                </CommitContainer>
                <Diff commit={selectedTree} diff={newCommit && commitHash === 'new-commit' && newCommit.diff} />
                <TutorialOverlay />
            </Container>
        );
    }
}

const RouterWrapper = (props: unknown[]): JSX.Element => {
    const params = useParams();
    const history = useHistory();
    console.log(params);
    return <Timeline params={params} history={history} {...props} />
}

export default Store.withStore(RouterWrapper);