import React, { PureComponent } from 'react';
import { DiffResult, ExtractedDataDiff, Commit } from 'main/lib/repository/types';
import Repository from 'app/utilities/Repository';
import styled from 'styled-components';
import DataType from 'app/utilities/DataType';
import Loading from 'app/components/Loading';
import { ProviderDatum } from 'main/providers/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { H3, H5 } from 'app/components/Typography';
import { Margin } from 'app/components/Utility';
import { formatDistanceToNow } from 'date-fns';
import Code from 'app/components/Code';

interface Props {
    commit: Commit;
    diff?: ExtractedDataDiff;
}

interface State {
    diff?: ExtractedDataDiff;
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 12px;
    grid-row: span 2;
    grid-area: diff;
    overflow-y: auto;
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
        const diff = await Repository.diff(this.props.commit.oid) as DiffResult<ExtractedDataDiff>[];
        this.setState({ diff: this.filterAndSortExtractedData(diff) });
    }

    filterAndSortExtractedData(diff: DiffResult<ExtractedDataDiff>[]): ExtractedDataDiff {
        const sortingFunction = (a: ProviderDatum<unknown>, b: ProviderDatum<unknown>): number => {
            return a.type.localeCompare(b.type);
        };

        const added = diff.flatMap((file) => file.diff.added || []).sort(sortingFunction);
        const updated = diff.flatMap((file) => file.diff.updated || []).sort(sortingFunction);
        const deleted = diff.flatMap((file) => file.diff.deleted || []).sort(sortingFunction);

        return {
            added,
            updated,
            deleted
        };
    }

    render(): JSX.Element {
        const diff = this.props.diff || this.state.diff;
        const { commit } = this.props;

        if (!diff) {
            return (
                <Container>
                    <Loading />
                </Container>
            );
        }

        return (
            <Container>
                <Margin>
                    <H3>{commit.message}</H3>
                    Committed {formatDistanceToNow(new Date(commit.author.when))} ago
                </Margin>
                {diff.added.length ? (
                    <Code added>
                        <H5>DATA ADDED</H5>
                    </Code>
                ) : null}
                {diff.added.map((datum, index) => (
                    <Code key={index} added>
                        <span><FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth /></span>
                        <MarginLeft>{DataType.toString(datum)}</MarginLeft>
                        <PullRight>{datum.type}</PullRight>
                    </Code>
                ))}
                {diff.updated.length ? (
                    <Code updated>
                        <H5>DATA UPDATED</H5>
                    </Code>
                ) : null}
                {diff.updated.map((datum, index) => (
                    <Code key={index} updated>
                        <span><FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth /></span>
                        <MarginLeft>{DataType.toString(datum)}</MarginLeft>
                        <PullRight>{datum.type}</PullRight>
                    </Code>
                ))}
                {diff.deleted.length ? (
                    <Code removed>
                        <H5>DATA REMOVED</H5>
                    </Code>
                ) : null}
                {diff.deleted.map((datum, index) => (
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