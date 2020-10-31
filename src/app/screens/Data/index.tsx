import React, { Component } from 'react';
import { ProvidedDataTypes, ProviderDatum } from 'main/providers/types';
import { TransitionDirection } from 'app/utilities/AnimatedSwitch';
import Repository from 'app/utilities/Repository';
import Loading from 'app/components/Loading';
import { uniq } from 'lodash-es';
import {
    Container,
    List,
    RowHeading,
    DataPointList,
    ClickableCategory,
    ClickableDataPoint,
} from './styles';
import DatumOverlay from './components/DatumOverlay';
import TutorialOverlay from './components/TutorialOverlay';
import { GroupedData, DeletedData } from './types';
import CreateNewCommit from './components/CreateNewCommit';
import { RouteProps } from '../types';
import { useHistory, useParams } from 'react-router-dom';
import type { History} from 'history';

interface State {
    // The data that is extracted from the commit
    groupedData?: GroupedData;
    // Any data that the user wishes to have deleted in a new commit
    deletedData: DeletedData;
}

interface Props {
    params: RouteProps['data'];
    history: History;
}

class Data extends Component<Props, State> {
    state: State = {
        groupedData: null,
        deletedData: Object.values(ProvidedDataTypes).reduce((obj: DeletedData, key) => {
            obj[key] = [];
            return obj;
        }, {}),
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
        const { params: {
            category,
            datumId
        } } = this.props;

        if ((event.key === 'Left' && datumId)) {
            this.props.history.push(`/data/${category}`)
        } else if (event.key === 'Escape') {
            if (datumId) {
                this.props.history.push(`/data/${category}`)
            } else if (category) {
                this.props.history.push(`/data`);
            } else {
                this.props.history.push(`/timeline?transition=${TransitionDirection.left}`);
            }
        }
    }

    // setCategory = (category: ProvidedDataTypes): void => 
    //     this.setState({ category, datumId: null });

    // setDatum = (datumId: number): void => this.setState({ datumId });
    
    deleteDatum = (): void => {
        const { deletedData } = this.state;
        const { params: {
            category,
            datumId
        } } = this.props;


        this.setState({
            deletedData: {
                ...deletedData,
                [category]: uniq([
                    ...deletedData[category],
                    datumId,
                ]),
            }
        })
    }

    // closeOverlay = (): void => this.setState({ datumId: null });

    render(): JSX.Element {
        const { 
            groupedData,
            deletedData,
        } = this.state;
        const { params: {
            category,
            datumId
        } } = this.props;
        const parsedDatumId = Number.parseInt(datumId);

        if (!groupedData) {
            return <Loading />;
        }

        return (
            <Container>
                <List>
                    <RowHeading>CATEGORIES</RowHeading>
                    {Object.values(ProvidedDataTypes).map((key) => (
                        <ClickableCategory
                            key={key}
                            type={key}
                            items={groupedData[key]?.length}
                            active={category === key}
                            disabled={!(key in groupedData)}
                            deleted={deletedData[key].length > 0}
                            onKeyUp={this.handleKeyUp}
                            data-telemetry-id={`new-commit-select-category-${key}`}
                        />
                    ))}
                </List>
                <DataPointList>
                    <RowHeading>DATA POINTS</RowHeading>
                    {category && groupedData[category].map((datum, index) => (
                        <ClickableDataPoint
                            type={category as ProvidedDataTypes}
                            datum={datum}
                            index={index}
                            active={parsedDatumId === index}
                            key={`${datum.type}-${index}`} 
                            deleted={deletedData[category].includes(index)}
                            onKeyUp={this.handleKeyUp}
                            data-telemetry-id={`new-commit-select-data-point-${index}`}
                        />
                    ))}
                </DataPointList>
                <DatumOverlay
                    datum={groupedData[category]?.[parsedDatumId]}
                    onDelete={this.deleteDatum}
                />
                <CreateNewCommit isModalOpen={false} groupedData={groupedData} deletedData={deletedData} />
                <TutorialOverlay />
            </Container>
        );
    }
}

const RouterWrapper = (...props: unknown[]): JSX.Element => {
    const params = useParams();
    const history = useHistory();
    return <Data {...props} params={params} history={history} />
}

export default RouterWrapper;