import React, { Component } from 'react';
import { DiffResult } from 'main/lib/repository/types';
import Repository from 'app/utilities/Repository';
import styled, { css } from 'styled-components';
import { Change } from 'diff';
import theme from 'app/styles/theme';

interface Props {
    commit: string;
}

interface State {
    diff?: DiffResult[];
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const Code = styled.div<{ removed?: boolean; added?: boolean }>`
    font-family: 'IBM Plex Mono';
    background-color: #eee;
    padding: 25px;
    min-width: 100%;
    line-height: 2;
    white-space: pre;

    ${props => props.added && css`
        background-color: ${theme.colors.green}22;
    `}

    ${props => props.removed && css`
        background-color: ${theme.colors.red}22;
    `}
`;

class Diff extends Component<Props, State> {
    state: State = {
        diff: null,
    }

    componentDidMount(): void {
        this.fetchDiff();
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.commit !== this.props.commit) {
            this.fetchDiff();
        }
    }

    fetchDiff = async (): Promise<void> => {
        this.setState({ diff: null });
        const diff = await Repository.diff(this.props.commit);
        this.setState({ diff });
    }

    render(): JSX.Element {
        const { diff } = this.state;

        if (!diff) {
            return <h1>Loading</h1>;
        }

        return (
            <Container>
                {diff.map((file: DiffResult) => (
                    <div key={file.filepath}>
                        <h3>{file.filepath}</h3>
                        <div>
                            {file.diff.map((change: Change, index) => (
                                <Code key={index} added={change.added} removed={change.removed}>{change.value}</Code>
                            ))}
                        </div>
                    </div>
                ))}
            </Container>
        )
    }
}

export default Diff;