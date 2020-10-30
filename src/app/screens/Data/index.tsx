import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button, { GhostButton } from 'app/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCloudUpload, faMinus, faSave } from 'app/assets/fa-light';
import { H2 } from 'app/components/Typography';
import { ProvidedDataTypes, ProviderDatum } from 'main/providers/types';
import { TransitionDirection } from 'app/utilities/AnimatedSwitch';
import Repository from 'app/utilities/Repository';
import Loading from 'app/components/Loading';
import MenuBar from 'app/components/MenuBar';
import { RouteComponentProps } from 'react-router';
import { uniq } from 'lodash-es';
import {
    Container,
    List,
    RowHeading,
    DataPointList,
    ClickableCategory,
    ClickableDataPoint,
    MarginLeft,
} from './styles';
import DatumOverlay from './components/DatumOverlay';
import Modal from 'app/components/Modal';
import DataType from 'app/utilities/DataType';
import Code from 'app/components/Code';
import TutorialOverlay from './components/TutorialOverlay';
import { TextInput, Label } from 'app/components/Input';
import Store, { StoreProps } from 'app/store';
import { ExtractedDataDiff, Commit } from 'main/lib/repository/types';

type GroupedData =  { [key: string]: ProviderDatum<string, ProvidedDataTypes>[] };
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
    // Whether the modal for saving the identity has been opened
    isModalOpen?: boolean;
    // The message for the new commit that is being created
    newCommitMessage?: string;
}

class Data extends Component<RouteComponentProps & StoreProps, State> {
    state: State = {
        selectedCategory: null,
        groupedData: null,
        deletedData: Object.values(ProvidedDataTypes).reduce((obj: DeletedData, key) => {
            obj[key] = [];
            return obj;
        }, {}),
        newCommitMessage: "",
    }

    async componentDidMount(): Promise<void> {
        // Retrieved all data for this commit from the repository
        const data = await Repository.parsedCommit() as ProviderDatum<string, ProvidedDataTypes>[];
        
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
    }

    /**
     * Handle simple keystrokes in order to navigate through the datapoints
     */
    handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
        if ((event.key === 'Left' && this.state.selectedDatum)) {
            this.setState({ selectedDatum: null });
        } else if (event.key === 'Escape') {
            if (this.state.selectedDatum) {
                this.setState({ selectedDatum: null });
            } else if (this.state.selectedCategory) {
                this.setState({ selectedCategory: null });
            } else {
                this.props.history.push(`/timeline?transition=${TransitionDirection.left}`);
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

    saveIdentity = (): void => {
        const { groupedData, deletedData, newCommitMessage } = this.state;

        // First, we'll retrieve all individual datapoints that have been deleted
        const deleted = Object.keys(deletedData).flatMap((key) => 
            deletedData[key].map((i) => groupedData[key][i])
        );

        // Then we'll construct a commit object that can be easily displayed in the log screen
        const commit: Commit & { diff: ExtractedDataDiff } = { 
            oid: 'new-commit',
            parents: [],
            message: newCommitMessage,
            author: {
                when: Math.floor(new Date().getTime() / 1000),
                name: undefined,
                email: undefined,
            },
            diff: { 
                deleted,
                updated: [],
                added: [],
            },
        };

        // Then, we'll store this commit in the store
        this.props.store.set('newCommit')(commit);

        // Lastly, we'll navigate back to the log
        this.props.history.push(`/timeline?transition=${TransitionDirection.left}&newCommit=true`);
    }

    closeOverlay = (): void => this.setState({ selectedDatum: null });
    closeModal = (): void => this.setState({ isModalOpen: false });
    openModal = (): void => this.setState({ isModalOpen: true });
    handleChangeCommitMessage = (event: React.ChangeEvent<HTMLInputElement>): void => this.setState({
        newCommitMessage: event.target.value,
    });

    render(): JSX.Element {
        const { 
            selectedCategory,
            groupedData,
            selectedDatum,
            deletedData,
            isModalOpen,
            newCommitMessage,
        } = this.state;

        if (!groupedData) {
            return <Loading />;
        }

        // Determine if there are any changes to the current identity
        const hasChanges = !!Object.values(deletedData).find(c => c.length > 0);

        return (
            <Container>
                <List>
                    <RowHeading>CATEGORIES</RowHeading>
                    {Object.values(ProvidedDataTypes).map((key) => (
                        <ClickableCategory
                            key={key}
                            type={key}
                            items={groupedData[key]?.length}
                            active={selectedCategory === key}
                            disabled={!(key in groupedData)}
                            onClick={this.setCategory}
                            deleted={deletedData[key].length > 0}
                            onKeyUp={this.handleKeyUp}
                            data-telemetry-id={`new-commit-select-category-${key}`}
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
                            onKeyUp={this.handleKeyUp}
                            data-telemetry-id={`new-commit-select-data-point-${index}`}
                        />
                    ))}
                </DataPointList>
                <DatumOverlay
                    datum={groupedData[selectedCategory]?.[selectedDatum]}
                    onClose={this.closeOverlay}
                    onDelete={this.deleteDatum}
                />
                <Modal isOpen={isModalOpen} onRequestClose={this.closeModal}>
                    <p style={{ padding: "0 16px" }}>You are about to commit a new identity, with the following changes. As with data requests, it may take some time for this data to actually be deleted from the platforms.</p>
                    <p style={{ padding: "0 16px" }}><i>This action is not reversible. However, your data will remain saved locally in Aeon.</i></p>
                    {Object.keys(deletedData).map(category =>
                        deletedData[category].map(key =>
                            <Code removed key={`preview-changes-${category}-${key}`}>
                                <span><FontAwesomeIcon icon={faMinus} fixedWidth /></span>
                                <MarginLeft><FontAwesomeIcon icon={DataType.getIcon(groupedData[category][key].type)} fixedWidth /></MarginLeft>
                                <MarginLeft>{DataType.toString(groupedData[category][key])}</MarginLeft>
                            </Code>
                        )
                    )}
                    <Label style={{ padding: 16 }}>
                        Identity Change Description 
                        <TextInput
                            placeholder={hasChanges
                                ? `Delete ${Object.keys(deletedData).find(d => d.length)} from identity...`
                                : "Delete part of identity..."}
                            onChange={this.handleChangeCommitMessage}
                            value={newCommitMessage}
                        />
                    </Label>
                    <Button
                        icon={faSave}
                        style={{ margin: '16px auto' }}
                        onClick={this.saveIdentity}
                        data-telemetry-id="confirm-save-new-identity"
                        disabled={!newCommitMessage}
                    >
                        Save new Identity
                    </Button>
                </Modal>
                <TutorialOverlay />
            </Container>
        );
    }
}

export default Store.withStore(Data);