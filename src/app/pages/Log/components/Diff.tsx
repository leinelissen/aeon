import React, { PureComponent } from 'react';
import { DiffResult, DiffType, ExtractedDataDiff, ObjectChange } from 'main/lib/repository/types';
import Repository from 'app/utilities/Repository';
import styled, { css } from 'styled-components';
import DataType from 'app/utilities/DataType';
import theme from 'app/styles/theme';
import Loading from 'app/components/Loading';
import { ProviderDatum, ProvidedDataTypes } from 'main/providers/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
    commit: string;
}

interface State {
    diff?: DiffResult<unknown>[];
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 12px;
    width: 100%;

    h3 {
        margin-left: 25px;
    }
`;

const Code = styled.div<{ removed?: boolean; added?: boolean }>`
    font-family: 'IBM Plex Mono';
    background-color: #f8f8f8;
    padding: 5px 25px;
    min-width: 100%;
    line-height: 2;
    white-space: pre-wrap;
    user-select: text;

    /* display: flex;
    flex-direction: row;
    align-items: top; */

    & > span {
        margin-left: 10px;
    }

    &.icon {
        height: 1em;
    }

    ${props => props.added && css`
        background-color: ${theme.colors.green}22;
    `}

    ${props => props.removed && css`
        background-color: ${theme.colors.red}22;
    `}
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
        const diff = await Repository.diff(this.props.commit);
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

        if (!diff) {
            return <Loading />;
        }

        const dataDiff = this.filterAndSortExtractedData();

        return (
            <Container>
                {dataDiff.added.map((datum, index) => (
                    <Code key={index} added={true}>
                        <FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth />
                        <span>{DataType.toString(datum)}</span>
                    </Code>
                ))}
                {dataDiff.deleted.map((datum, index) => (
                    <Code key={index} removed={true}>
                        <FontAwesomeIcon icon={DataType.getIcon(datum.type)} fixedWidth />
                        <span>{DataType.toString(datum)}</span>
                    </Code>
                ))}
            </Container>
        )
    }
}

export default Diff;