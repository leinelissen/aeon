import React, { PureComponent } from 'react';
import { DiffResult, DiffType, ExtractedDataDiff, ObjectChange } from 'main/lib/repository/types';
import Repository from 'app/utilities/Repository';
import styled, { css } from 'styled-components';
import DataType from 'app/utilities/DataType';
import theme from 'app/styles/theme';
import Loading from 'app/components/Loading';
import { ProviderDatum, ProvidedDataTypes } from 'main/providers/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { H3, H5 } from 'app/components/Typography';
import { Margin } from 'app/components/Utility';
import { ReadCommitResult } from 'isomorphic-git';
import { formatDistanceToNow } from 'date-fns';

interface Props {
    commit: ReadCommitResult;
}

interface State {
    diff?: DiffResult<unknown>[];
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 12px;
    grid-row: span 2;
    grid-area: diff;
    overflow-y: scroll;

    h3 {
        margin-left: 25px;
    }
`;

const Code = styled.div<{ removed?: boolean; added?: boolean; updated?: boolean }>`
    font-family: 'IBM Plex Mono';
    background-color: #f8f8f8;
    padding: 5px 25px;
    min-width: 100%;
    line-height: 2;
    white-space: pre-wrap;
    user-select: text;
    display: flex;
    word-break: break-all;

    &.icon {
        height: 1em;
    }

    ${props => props.added && css`
        background-color: ${theme.colors.green}22;
    `}

    ${props => props.removed && css`
        background-color: ${theme.colors.red}22;
    `}

    ${props => props.updated && css`
        background-color: ${theme.colors.yellow}22;
    `}
`;

const MarginLeft = styled.span`
    margin-left: 10px;
`;

const PullRight = styled.span`
    margin-left: auto;
    opacity: 0.22;
    text-transform: uppercase;
    flex-shrink: 0;
`;

class Diff extends PureComponent<Props, State> {
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
        const diff = await Repository.diff(this.props.commit.oid);
        this.setState({ diff });
    }

    filterAndSortExtractedData(): ExtractedDataDiff {
        const { diff } = this.state;
        const filteredDiff = diff.filter(file => file.type !== DiffType.EXTRACTED_DATA) as DiffResult<ExtractedDataDiff>[];

        const sortingFunction = (a: ProviderDatum<unknown>, b: ProviderDatum<unknown>): number => {
            return a.type.localeCompare(b.type);
        };

        const added = filteredDiff.flatMap((file) => file.diff.added || []).sort(sortingFunction);
        const updated = filteredDiff.flatMap((file) => file.diff.updated || []).sort(sortingFunction);
        const deleted = filteredDiff.flatMap((file) => file.diff.deleted || []).sort(sortingFunction);

        return {
            added,
            updated,
            deleted
        };
    }

    render(): JSX.Element {
        const { diff } = this.state;
        const { commit } = this.props;

        if (!diff) {
            return (
                <Container>
                    <Loading />
                </Container>
            );
        }

        const dataDiff = this.filterAndSortExtractedData();

        return (
            <Container>
                <Margin>
                    <H3>{commit.commit.message}</H3>
                    Committed {formatDistanceToNow(new Date(commit.commit.author.timestamp * 1000))} ago
                </Margin>
                {dataDiff.added.length ? (
                    <Code added>
                        <H5>DATA ADDED</H5>
                    </Code>
                ) : null}
                {dataDiff.added.map((datum, index) => (
                    <Code key={index} added>
                        <span><FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth /></span>
                        <MarginLeft>{DataType.toString(datum)}</MarginLeft>
                        <PullRight>{datum.type}</PullRight>
                    </Code>
                ))}
                {dataDiff.updated.length ? (
                    <Code updated>
                        <H5>DATA UPDATED</H5>
                    </Code>
                ) : null}
                {dataDiff.updated.map((datum, index) => (
                    <Code key={index} updated>
                        <span><FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth /></span>
                        <MarginLeft>{DataType.toString(datum)}</MarginLeft>
                        <PullRight>{datum.type}</PullRight>
                    </Code>
                ))}
                {dataDiff.deleted.length ? (
                    <Code removed>
                        <H5>DATA REMOVED</H5>
                    </Code>
                ) : null}
                {dataDiff.deleted.map((datum, index) => (
                    <Code key={index} removed>
                        <span><FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth /></span>
                        <MarginLeft>{DataType.toString(datum)}</MarginLeft>
                        <PullRight>{datum.type}</PullRight>
                    </Code>
                ))}
            </Container>
        )
    }
}

export default Diff;