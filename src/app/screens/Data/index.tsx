import React from 'react';
import { ProvidedDataTypes } from "main/providers/types/Data";
import Loading from 'app/components/Loading';
import {
    ClickableCategory,
    ClickableDataPoint,
} from './styles';
import DatumOverlay from './components/DatumOverlay';
import { RouteProps } from '../types';
import { useParams } from 'react-router-dom';
import { Category, List, PanelGrid } from 'app/components/PanelGrid';
import NoData from 'app/components/NoData';
import { useSelector } from 'react-redux';
import { State } from 'app/store';
import useTour from 'app/components/Tour/useTour';

function Data(): JSX.Element {
    useTour('/screen/data');
    const { category, datumId } = useParams<RouteProps['data']>();
    const {
        isLoading,
        byKey,
        byType,
        deleted,
        deletedByType
    } = useSelector((state: State) => state.data);
    const parsedDatumId = Number.parseInt(datumId);

    if (isLoading) {
        return <Loading />;
    }

    if (!byKey.length) {
        return <NoData />;
    }

    return (
        <PanelGrid>
            <List data-tour="data-categories-list">
                <Category title="Categories">
                    {Object.values(ProvidedDataTypes)
                        .filter((k) => byType[k].length > 0)
                        .map((key) => (
                            <ClickableCategory
                                key={key}
                                type={key}
                                items={byType[key].length}
                                disabled={byType[key].length > 0}
                                deleted={deletedByType[key].length > 0}
                                data-tour={byType[key].length ? "data-category-button" : ""}
                                data-telemetry-id={`new-commit-select-category-${key}`}
                            />
                        ))
                    }
                </Category>
            </List>
            <List data-tour="data-data-points-list">
                <Category title="Data Points">
                    {category && byType[category].map((datum) => (
                        <ClickableDataPoint
                            type={category as ProvidedDataTypes}
                            datum={byKey[datum]}
                            index={datum}
                            key={`datum-${datum}`} 
                            deleted={deleted.includes(datum)}
                            data-tour="data-data-point-button"
                            data-telemetry-id={`new-commit-select-data-point-${datum}`}
                        />
                    ))}
                </Category>
            </List>
            <List>
                <DatumOverlay datumId={parsedDatumId} />
            </List>
        </PanelGrid>
    );
}

export default Data;