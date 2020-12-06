import React, { Component } from 'react';
import Repository from 'app/utilities/Repository';
import styled from 'styled-components';
import Commit, { TimelineLine } from './components/Commit';
import Diff from './components/Diff';
import Loading from 'app/components/Loading';
import { RepositoryEvents, Commit as CommitType } from 'main/lib/repository/types';
import { IpcRendererEvent } from 'electron';
import { State as AppState } from 'app/store';
import { useHistory, useParams } from 'react-router-dom';
import { RouteProps } from '../types';
import { History } from 'history';
import { List, PanelGrid } from 'app/components/PanelGrid';
import { connect } from 'react-redux';
import NoData from '../../components/NoData';
import Tour from 'app/components/Tour';

interface State {
    log: CommitType[];
    updating: boolean;
}

interface Props {
    params: RouteProps['timeline'];
    history: History;
    newCommits: AppState['newCommits'];
}

const CommitContainer = styled.div`
    display: flex;
    grid-area: "commits";
    flex-direction: column;
    position: relative;
    top: 0;
    flex-shrink: 0;
    border-right: 1px solid #eee;
    overflow-y: auto;
    padding-top: 40px;
`;

class Timeline extends Component<Props, State> {
    state: State = {
        log: null,
        updating: false,
    };

    componentDidMount(): void {
        this.fetchLog();
        Repository.subscribe(this.handleEvent);
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.params.commitHash !== this.props.params.commitHash) {
            this.fetchLog();
        }
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

    render(): JSX.Element {
        const { log } = this.state;
        const { params: { commitHash }, newCommits } = this.props;

        if (!log) {
            return <Loading />;
        }
        
        if (log.length <= 1) {
            return <NoData />;
        }
        
        const selectedTree = commitHash === 'new-commit'
            ? newCommits[0]
            : log.find(d => d.oid === commitHash);

        return (
            <>
                <PanelGrid columns={2} noTopPadding> 
                    <List>
                        <TimelineLine />
                        <CommitContainer data-tour="timeline-commits-list">
                            {newCommits.length ? 
                                <Commit
                                    entry={newCommits[0]}
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
                                    data-tour={i === 0 ? 'timeline-first-commit' : undefined}
                                />
                            ))}
                        </CommitContainer>
                    </List>
                    <List topMargin>
                        <Diff commit={selectedTree} diff={newCommits.length && commitHash === 'new-commit' && newCommits[0].diff} />
                    </List>
                </PanelGrid>
                <Tour tour="/screen/timeline" />
            </>
        );
    }
}

const RouterWrapper = (props: Pick<Props, 'newCommits'>): JSX.Element => {
    const params = useParams();
    const history = useHistory();
    return <Timeline params={params} history={history} {...props} />
}

const mapStateToProps = (state: AppState) => {
    return {
        newCommits: state.newCommits
    };
}

export default connect(mapStateToProps)(RouterWrapper);