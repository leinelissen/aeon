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
import MenuBar from 'app/components/MenuBar';
import { slideProps, SlideDirection } from 'app/components/SlideIn';
import { Transition } from 'react-spring/renderprops';
import { RouteComponentProps } from 'react-router';

type GroupedData =  { [key: string]: ProviderDatum<string, unknown>[] };

interface State {
    groupedData?: GroupedData;
    selectedCategory?: ProvidedDataTypes;
    selectedDatum?: ProviderDatum<unknown, unknown>;
}

const Container = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto 1fr;
    height: 100%;
    background: white;
    position: relative;
`;

const RightSideOverlay = styled.div`
    position: absolute;
    background-color: white;
    z-index: 2;
    grid-column: 3 / 4;
    grid-row: 2 / 3;
    width: 100%;
    height: 100%;
    padding: 32px 16px 16px 16px;
    box-shadow: -1px 0 1px rgba(0,0,0,0.01), 
              -2px 0 2px rgba(0,0,0,0.01), 
              -4px 0 4px rgba(0,0,0,0.01), 
              -8px 0 8px rgba(0,0,0,0.01), 
              -16px 0 16px rgba(0,0,0,0.01), 
              -32px 0 32px rgba(0,0,0,0.01);
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${theme.colors.border};
    flex-grow: 1;
    overflow-y: scroll;
    position: relative;
`;

const DataPointList = styled(List)`
    grid-column: 2 / 4;
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

const CloseButton = styled(GhostButton)`
    position: absolute;
    left: 8px;
    top: 8px;
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

class NewCommit extends Component<RouteComponentProps, State> {
    state: State = {
        selectedCategory: null,
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
        
        document.addEventListener('keyup', this.handleKeyUp);
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyUp = (event: KeyboardEvent): void => {
        if ((event.key === 'Left' && this.state.selectedDatum)) {
            this.setState({ selectedDatum: null });
        } else if (event.key === 'Escape') {
            if (this.state.selectedDatum) {
                this.setState({ selectedDatum: null });
            } else if (this.state.selectedCategory) {
                this.setState({ selectedCategory: null });
            } else {
                this.props.history.push(`/log?transition=${TransitionDirection.left}`);
            }
        }
    }


    setCategory = (selectedCategory: ProvidedDataTypes): void => 
        this.setState({ selectedCategory, selectedDatum: null });

    setDatum = (selectedDatum: ProviderDatum<unknown, unknown>): void => this.setState({ selectedDatum });
    
    closeOverlay = (): void => this.setState({ selectedDatum: null });

    render(): JSX.Element {
        const { selectedCategory, groupedData, selectedDatum } = this.state;

        if (!groupedData) {
            return <Loading />;
        }

        return (
            <Container>
                <MenuBar>
                    <Link to={`/log?transition=${TransitionDirection.left}`}>
                        <GhostButton>
                            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 5 }} /> Back
                        </GhostButton>
                    </Link>
                    <H2>New Identity Update</H2>
                    <Button icon={faCloudUpload} style={{ marginLeft: 'auto' }}>
                        Save Identity
                    </Button>
                </MenuBar>
                <List>
                    <RowHeading>CATEGORIES</RowHeading>
                    {Object.values(ProvidedDataTypes).map((key) => (
                        <ClickableCategory
                            key={key}
                            type={key}
                            active={selectedCategory === key}
                            disabled={!(key in groupedData)}
                            onClick={this.setCategory}
                        />
                    ))}
                </List>
                <DataPointList>
                    <RowHeading>DATA POINTS</RowHeading>
                    {selectedCategory && groupedData[selectedCategory].map((datum, index) => (
                        <ClickableDataPoint
                            datum={datum}
                            active={selectedDatum === datum}
                            key={`${datum.type}-${index}`} 
                            onClick={this.setDatum}
                        />
                    ))}
                </DataPointList>
                <Transition 
                    items={selectedDatum}
                    {...slideProps(SlideDirection.RIGHT)}
                >
                    {providedDatum => providedDatum && 
                        (props =>
                            <RightSideOverlay style={props}>
                                <CloseButton onClick={this.closeOverlay}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </CloseButton>
                                <p><strong>{DataType.toString(providedDatum)}</strong></p>
                                <p>{providedDatum.timestamp?.toLocaleString()}</p>
                                <Button fullWidth color={theme.colors.red}>
                                    Delete this data point
                                </Button>
                                <Button fullWidth color={theme.colors.yellow}>
                                    Modify this data point
                                </Button>
                            </RightSideOverlay>
                        )
                    }
                </Transition>
            </Container>
        );
    }
}

export default NewCommit;