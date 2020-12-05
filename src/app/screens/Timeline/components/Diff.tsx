import React, { PureComponent } from 'react';
import { DiffResult, ExtractedDataDiff, Commit } from 'main/lib/repository/types';
import Repository from 'app/utilities/Repository';
import styled from 'styled-components';
import DataType from 'app/utilities/DataType';
import Loading from 'app/components/Loading';
import { ProviderDatum } from 'main/providers/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { H2, H5 } from 'app/components/Typography';
import { formatDistanceToNow } from 'date-fns';
import Code from 'app/components/Code';
import RightSideOverlay, { Section } from 'app/components/RightSideOverlay';
import { faCodeCommit, faPlus } from 'app/assets/fa-light';
import { MarginLeft, PullContainer } from 'app/components/Utility';

interface Props {
    commit: Commit;
    diff?: ExtractedDataDiff;
}

interface State {
    diff?: ExtractedDataDiff;
}

const PullRight = styled.span`
    margin-left: auto;
    opacity: 0.5;
    text-transform: uppercase;
    flex-shrink: 0;
`;

const DiffItem = styled.div`
    display: flex;
`;

const CodeRectifier = styled.div`
    ${Code}:first-child {
        margin-top: 0px;
    }

    ${Code}:last-child {
        margin-bottom: 0px;
    }
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
                <RightSideOverlay>
                    <Loading />
                </RightSideOverlay>
            );
        }

        return (
            <RightSideOverlay>
                <>
                    <Section>
                        <H2>
                            <PullContainer verticalAlign>
                                <FontAwesomeIcon icon={faCodeCommit} fixedWidth />
                                <MarginLeft>{commit.message}</MarginLeft>
                            </PullContainer>
                        </H2>
                    </Section>
                    <Section>
                        <PullContainer verticalAlign>
                            <FontAwesomeIcon icon={faPlus} />
                            <MarginLeft>Committed {formatDistanceToNow(new Date(commit.author.when))} ago</MarginLeft>
                        </PullContainer>
                    </Section>
                    <CodeRectifier>
                        {(diff.added.length || diff.updated.length || diff.deleted.length) ?
                            <Section smallPadding>
                                {diff.added.length ? (
                                    <Code added>
                                        <H5>DATA ADDED</H5>
                                        {diff.added.map((datum, index) => (
                                            <DiffItem key={'data_added_' + index}>
                                                <span><FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth /></span>
                                                <MarginLeft>{DataType.toString(datum)}</MarginLeft>
                                                <PullRight>{datum.type}</PullRight>
                                            </DiffItem>
                                        ))}
                                    </Code>
                                ) : null}
                                {diff.updated.length ? (
                                    <Code updated>
                                        <H5>DATA UPDATED</H5>
                                        {diff.updated.map((datum, index) => (
                                            <DiffItem key={'data_updated_' + index}>
                                                <span><FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth /></span>
                                                <MarginLeft>{DataType.toString(datum)}</MarginLeft>
                                                <PullRight>{datum.type}</PullRight>
                                            </DiffItem>
                                        ))}
                                    </Code>
                                ) : null}
                                {diff.deleted.length ? (
                                    <Code removed>
                                        <H5>DATA REMOVED</H5>
                                        {diff.deleted.map((datum, index) => (
                                            <DiffItem key={'data_removed_' + index}>
                                                <span><FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth /></span>
                                                <MarginLeft>{DataType.toString(datum)}</MarginLeft>
                                                <PullRight>{datum.type}</PullRight>
                                            </DiffItem>
                                        ))}
                                    </Code>
                                ) : null}
                            </Section>
                            : null}
                    </CodeRectifier>
                </>
            </RightSideOverlay>
        )
    }
}

export default Diff;