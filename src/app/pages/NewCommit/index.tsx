import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button, { GhostButton } from 'app/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCloudUpload } from '@fortawesome/pro-light-svg-icons';
import { H2 } from 'app/components/Typography';
import { ProvidedDataTypes, ProviderDatum } from 'main/providers/types';
import { TransitionDirection } from 'app/utilities/AnimatedSwitch';
import Repository from 'app/utilities/Repository';
import Loading from 'app/components/Loading';
import MenuBar from 'app/components/MenuBar';
import { RouteComponentProps } from 'react-router';
import { uniq } from 'lodash';
import {
    Container,
    List,
    RowHeading,
    DataPointList,
    ClickableCategory,
    ClickableDataPoint
} from './styles';
import DatumOverlay from './components/DatumOverlay';

type GroupedData =  { [key: string]: ProviderDatum<string, unknown>[] };
type DeletedData = { [key: string]: number[] };

interface State {
    // The data that is extracted from the commit
    groupedData?: GroupedData;
    // Any data that the user wishes to have deleted in a new commit
    deletedData: DeletedData;
    // The category that has been selected
    selectedCategory?: ProvidedDataTypes;
    // The datum in a particular data category that has been selected
    selectedDatum?: number;
}

class NewCommit extends Component<RouteComponentProps, State> {
    state: State = {
        selectedCategory: null,
        groupedData: null,
        deletedData: Object.values(ProvidedDataTypes).reduce((obj: DeletedData, key) => {
            obj[key] = [];
            return obj;
        }, {}),
    }

    async componentDidMount(): Promise<void> {
        // Retrieved all data for this commit from the repository
        const data = await Repository.parsedCommit() as ProviderDatum<string, any>[];
        
        // Then sort the data into their respective categories
        const groupedData = data.reduce((accumulator: GroupedData, datum): GroupedData => {
            // If there is no category yet, create it
            if (!accumulator[datum.type]) {
                accumulator[datum.type] = [];
            }

            // Then push the data type to the right category
            accumulator[datum.type].push(datum);

            // And return the resulting object
            return accumulator;
        }, {});

        this.setState({ groupedData });
        
        // Also add a listener so we can handle keyboard events
        document.addEventListener('keyup', this.handleKeyUp);
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Handle simple keystrokes in order to navigate through the datapoints
     */
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

    setDatum = (selectedDatum: number): void => this.setState({ selectedDatum });
    
    deleteDatum = (): void => {
        const { selectedDatum, selectedCategory, deletedData } = this.state;

        this.setState({
            deletedData: {
                ...deletedData,
                [selectedCategory]: uniq([
                    ...deletedData[selectedCategory],
                    selectedDatum,
                ]),
            }
        })
    }

    closeOverlay = (): void => this.setState({ selectedDatum: null });

    render(): JSX.Element {
        const { 
            selectedCategory,
            groupedData,
            selectedDatum,
            deletedData
        } = this.state;

        if (!groupedData) {
            return <Loading />;
        }

        console.log(this.state);

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
                            deleted={deletedData[key].length > 0}
                        />
                    ))}
                </List>
                <DataPointList>
                    <RowHeading>DATA POINTS</RowHeading>
                    {selectedCategory && groupedData[selectedCategory].map((datum, index) => (
                        <ClickableDataPoint
                            datum={datum}
                            index={index}
                            active={selectedDatum === index}
                            key={`${datum.type}-${index}`} 
                            onClick={this.setDatum}
                            deleted={deletedData[selectedCategory].includes(index)}
                        />
                    ))}
                </DataPointList>
                <DatumOverlay
                    datum={groupedData[selectedCategory]?.[selectedDatum]}
                    onClose={this.closeOverlay}
                    onDelete={this.deleteDatum}
                />
            </Container>
        );
    }
}

export default NewCommit;