import React, { Component } from 'react';
import Repository from 'app/utilities/Repository';
import { ReadCommitResult } from 'isomorphic-git';
import styled from 'styled-components';
import Commit from './components/Commit';
import Diff from './components/Diff';

interface State {
    log: ReadCommitResult[];
    selectedCommit?: string;
}

const Container = styled.div`
    display: flex;
`

const CommitContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    flex-shrink: 0;
`


class Log extends Component<{}, State> {
    state: State = {
        log: [],
        selectedCommit: null,
    };

    componentDidMount(): void {
        Repository.log()
            .then(log => this.setState({ log, selectedCommit: log[0].oid }));
    }

    handleClick = (hash: string): void => {
        this.setState({ selectedCommit: hash });
    }

    render(): JSX.Element {
        const { log, selectedCommit } = this.state;

        if (!log.length) {
            return <h1>Loading...</h1>;
        }

        return (
            <Container>
                <CommitContainer>
                    {log.map((entry: ReadCommitResult) => (
                        <Commit key={entry.oid} entry={entry} onClick={this.handleClick} active={entry.oid === selectedCommit} />
                    ))}
                </CommitContainer>
                <Diff commit={selectedCommit} />
            </Container>
        );
    }
}

export default Log;