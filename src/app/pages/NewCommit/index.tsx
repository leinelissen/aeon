import React, { Component, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import Button, { GhostButton } from 'app/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCloudUpload, IconDefinition, faChevronRight } from '@fortawesome/pro-light-svg-icons';
import { H2 } from 'app/components/Typography';
import theme from 'app/styles/theme';
import { ProvidedDataTypes, ProviderDatum } from 'main/providers/types';
import DataType from 'app/utilities/DataType';
import { TransitionDirection } from 'app/utilities/AnimatedSwitch';
import Repository from 'app/utilities/Repository';
import Loading from 'app/components/Loading';

type GroupedData =  { [key: string]: ProviderDatum<string, unknown>[] };

interface State {
    category?: ProvidedDataTypes;
    groupedData?: GroupedData;
    datum?: ProviderDatum<unknown, unknown>;
}

const Container = styled.div`
    display: grid;
    grid-template-columns: 33% 67%;
    grid-template-rows: auto 1fr;
    height: calc(100vh - 40px);
    background: white;
    position: relative;
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${theme.colors.border};
    padding: 16px 8px;
    grid-column: 1 / span 2;
`;

const RightSideOverlay = styled.div`
    position: absolute;
    right: 0;
    height: 80vh;
    width: 33vw;
    bottom: 0;
    background-color: white;
    border-left: 1px solid ${theme.colors.border};
    z-index: 2;
    padding: 16px;
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${theme.colors.border};
    flex-grow: 1;
    overflow-y: scroll;
    position: relative;
`;

const ListItem = styled.div`
    padding: 8px 32px;
    flex-grow: 0;
    flex-shrink: 0;
`;

const RowHeading = styled(ListItem)`
    border-bottom: 1px solid ${theme.colors.border};
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.5);
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    align-self: flex-start;
    background: white;
    z-index: 2;
    width: 100%;
`;

const SubHeading = styled(RowHeading)`
    font-size: 10px;
    color: rgba(0, 0, 0, 0.4);
`;

const ListButton = styled.button<{ active?: boolean }>`
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    font-size: 14px;
    opacity: 0.7;
    margin: 0;
    padding: 14px 24px 14px 32px;
    font-weight: 400;

    ${props => props.active ? css`
        background: #eee;
        opacity: 0.9;
    ` : css`
        &:hover {
            background-color: #f8f8f8;
            opacity: 0.8;
        }
    `}
`;

interface ClickableCategoryProps {
    type: ProvidedDataTypes;
    onClick: (activity: ProvidedDataTypes) => void;
    active?: boolean;
    disabled?: boolean;
}

const ClickableCategory = ({ type, onClick, ...props }: ClickableCategoryProps): JSX.Element => {
    const handleClick = useCallback(() => {
        return onClick(type);
    }, [onClick, type]);

    return (
        <ListButton onClick={handleClick} {...props}>
            <FontAwesomeIcon icon={DataType.getIcon(type)} fixedWidth style={{ marginRight: 8 }} />
            {type}
            <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </ListButton>
    );
};

interface ClickableDataPointProps {
    datum: ProviderDatum<unknown, unknown>;
    onClick: (datum: ProviderDatum<unknown, unknown>) => void;
    active?: boolean;
    disabled?: boolean;
}

const ClickableDataPoint = ({ datum, onClick, ...props }: ClickableDataPointProps): JSX.Element => {
    const handleClick = useCallback(() => {
        return onClick(datum);
    }, [onClick, datum]);

    return (
        <ListButton onClick={handleClick} {...props}>
            <FontAwesomeIcon icon={DataType.getIcon(datum.type as ProvidedDataTypes)} fixedWidth style={{ marginRight: 8 }} />
            {DataType.toString(datum)}
            <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </ListButton>
    );
};

class NewCommit extends Component<{}, State> {
    state: State = {
        category: null,
        groupedData: null,
    }

    async componentDidMount(): Promise<void> {
        const data = await Repository.parsedCommit() as ProviderDatum<string, any>[];
        const groupedData = data.reduce((accumulator: GroupedData, datum): GroupedData => {
            if (!accumulator[datum.type]) {
                accumulator[datum.type] = [];
            }

            accumulator[datum.type].push(datum);

            return accumulator;
        }, {});

        this.setState({ groupedData });
    }

    setCategory = (category: ProvidedDataTypes): void => this.setState({ category, datum: null });
    setDatum = (datum: ProviderDatum<unknown, unknown>): void => this.setState({ datum });

    render(): JSX.Element {
        const { category, groupedData, datum } = this.state;

        if (!groupedData) {
            return <Loading />;
        }

        return (
            <Container>
                <TopBar>
                    <Link to={`/log?transition=${TransitionDirection.left}`}>
                        <GhostButton>
                            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} /> Back
                        </GhostButton>
                    </Link>
                    <H2>New Identity Update</H2>
                    <Button icon={faCloudUpload} style={{ marginLeft: 'auto' }}>
                        Save Identity
                    </Button>
                </TopBar>
                <List>
                    <RowHeading>CATEGORIES</RowHeading>
                    {Object.values(ProvidedDataTypes).map((key) => (
                        <ClickableCategory
                            key={key}
                            type={key}
                            active={category === key}
                            disabled={!(key in groupedData)}
                            onClick={this.setCategory}
                        />
                    ))}
                </List>
                <List>
                    <RowHeading>DATA POINTS</RowHeading>
                    {category && groupedData[category].map((datum, index) => (
                        <ClickableDataPoint
                            datum={datum}
                            key={`${datum.type}-${index}`} 
                            onClick={this.setDatum}
                        />
                    ))}
                </List>
                {datum && (
                    <RightSideOverlay>
                        <p><strong>{DataType.toString(datum)}</strong></p>
                        <p>{datum.timestamp?.toLocaleString()}</p>
                        <Button fullWidth color={theme.colors.red}>
                            Delete this data point
                        </Button>
                        <Button fullWidth color={theme.colors.yellow}>
                            Modify this data point
                        </Button>
                    </RightSideOverlay>
                )}
            </Container>
        );
    }
}

export default NewCommit;