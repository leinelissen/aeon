import React, { PureComponent } from 'react';
import { DiffResult, ExtractedDataDiff, Commit } from 'main/lib/repository/types';
import Repository from 'app/utilities/Repository';
import styled from 'styled-components';
import DataType from 'app/utilities/DataType';
import Loading from 'app/components/Loading';
import { ProviderDatum } from "main/providers/types/Data";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FontLarge, H2, H5 } from 'app/components/Typography';
import { formatDistanceToNow } from 'date-fns';
import Code from 'app/components/Code';
import RightSideOverlay, { RightSideOverlayOffset, Section } from 'app/components/RightSideOverlay';
import { faCodeBranch, faLink, faPlus, faSync, faUser } from '@fortawesome/free-solid-svg-icons';
import { MarginLeft, PullContainer } from 'app/components/Utility';
import convertMetaToObject from 'app/utilities/convertMetaToObject';
import Providers from 'app/utilities/Providers';

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
        const diff = await Repository.diff(this.props.commit?.oid) as DiffResult<ExtractedDataDiff>[];
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

        if (!diff || !commit) {
            return (
                <RightSideOverlay>
                    <Loading />
                </RightSideOverlay>
            );
        }

        const meta = convertMetaToObject(commit?.message);

        return (
            <RightSideOverlayOffset>
                <RightSideOverlay data-tour="timeline-diff-container">
                    <>
                        <Section>
                            <H2>
                                <PullContainer verticalAlign>
                                    <FontAwesomeIcon icon={faCodeBranch} fixedWidth />
                                    <MarginLeft>{meta.title}</MarginLeft>
                                </PullContainer>
                            </H2>
                        </Section>
                        <Section data-tour="timeline-diff-info">
                            <FontLarge>
                                <PullContainer verticalAlign>
                                    <FontAwesomeIcon icon={faPlus} />
                                    <MarginLeft>Committed {formatDistanceToNow(new Date(commit.author.when))} ago</MarginLeft>
                                </PullContainer>
                                {meta.provider && <PullContainer verticalAlign>
                                    <FontAwesomeIcon icon={Providers.getIcon(meta.provider)} />
                                    <MarginLeft>{meta.provider}</MarginLeft>
                                </PullContainer>}
                                {meta.account && <PullContainer verticalAlign>
                                    <FontAwesomeIcon icon={faUser} />
                                    <MarginLeft>{meta.account}</MarginLeft>
                                </PullContainer>}
                                {meta.updateType && <PullContainer verticalAlign>
                                    <FontAwesomeIcon icon={faSync} />
                                    <MarginLeft>{meta.updateType}</MarginLeft>
                                </PullContainer>}
                                {meta.url && <PullContainer verticalAlign>
                                    <FontAwesomeIcon icon={faLink} />
                                    <MarginLeft>{meta.url}</MarginLeft>
                                </PullContainer>}
                            </FontLarge>
                        </Section>
                        <CodeRectifier data-tour="timeline-diff-data">
                            {(diff.added.length || diff.updated.length || diff.deleted.length) ?
                                <Section>
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
            </RightSideOverlayOffset>
        )
    }
}

export default Diff;