import React, { useCallback } from 'react';
import Button from 'app/components/Button';
import { ProvidedDataTypes } from "main/providers/types/Data";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCassetteTape, faClock, faLink, faUser } from 'app/assets/fa-light';
import { H2 } from 'app/components/Typography';
import DataType from 'app/utilities/DataType';
import Providers from 'app/utilities/Providers';
import RightSideOverlay, { DetailListItem, RightSideOverlayOffset, Section } from 'app/components/RightSideOverlay';
import { useHistory, useParams } from 'react-router-dom';
import { RouteProps } from 'app/screens/types';
import { State, useAppDispatch } from 'app/store';
import { deleteDatum } from 'app/store/data/actions';
import { useSelector } from 'react-redux';

interface Props {
    datumId: number;
}

const DatumOverlay = ({ datumId }: Props): JSX.Element => {
    const { byKey, deleted } = useSelector((state: State) => state.data);
    const datum = datumId && byKey[datumId];
    const isDeleted = datumId && deleted.includes(datumId);

    // Create handler that redirects the page if the overlay is closed
    const { category } = useParams<RouteProps['data']>();
    const history = useHistory();
    const handleClose = useCallback(() => {
        if (history.location.pathname.startsWith('/data')){
            history.push(`/data/${category}`);
        } else if (history.location.pathname.startsWith('/graph')) {
            history.push('/graph');
        }
    }, [history, category]);

    // Create handler for deleting data points
    const dispatch = useAppDispatch();
    const handleDelete = useCallback(() => {
        dispatch(deleteDatum(datumId));
    }, [dispatch, datumId]);

    return (
        <RightSideOverlay onClose={handleClose} data-tour="data-datum-overlay" marginTop={50}>
            {datum && (
                <>
                    <Section>
                        <H2 style={{ color: isDeleted ? 'var(--color-red-500)' : 'inherit' }}>
                            <FontAwesomeIcon
                                icon={DataType.getIcon(datum.type as ProvidedDataTypes)}
                                style={{ marginRight: 8 }}
                            />
                            {DataType.toString(datum)}
                        </H2>
                        {isDeleted && <p>
                            This data point is marked for erasure    
                        </p>}
                    </Section>
                    <Section>
                        <DetailListItem>
                            <span>
                                <FontAwesomeIcon
                                    icon={Providers.getIcon(datum.provider)}
                                    fixedWidth
                                />
                            </span>
                            <span style={{ textTransform: 'capitalize' }}>
                                {datum.provider.replace(/(_|-)/g, ' ')}
                            </span>
                        </DetailListItem>
                        {datum.hostname && 
                            <DetailListItem>
                                <span>
                                    <FontAwesomeIcon
                                        icon={faLink}
                                        fixedWidth
                                    />
                                </span>
                                <span>{datum.hostname}</span>
                            </DetailListItem>
                        }
                        {datum.account && 
                            <DetailListItem>
                                <span>
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        fixedWidth
                                    />
                                </span>
                                <span>{datum.account}</span>
                            </DetailListItem>
                        }
                        <DetailListItem>
                            <span>
                                <FontAwesomeIcon icon={faCassetteTape} fixedWidth />
                            </span>
                            <span style={{ textTransform: 'uppercase' }}>
                                {datum.type}
                            </span>
                        </DetailListItem>
                        {datum.timestamp &&                            
                            <DetailListItem>
                                <span>
                                    <FontAwesomeIcon icon={faClock} fixedWidth />
                                </span>
                                <span>
                                    {datum.timestamp?.toLocaleString()}
                                </span>
                            </DetailListItem>
                        }
                        {/* <DetailListItem>
                            <span>
                                <FontAwesomeIcon icon={faHashtag} fixedWidth />
                            </span>
                            <span>
                                2 other occurrences on other platforms
                            </span>
                        </DetailListItem>
                        <DetailListItem>
                            <span>
                                <FontAwesomeIcon icon={faEye} fixedWidth />
                            </span>
                            <span>
                                Data is visisble
                            </span>
                        </DetailListItem> */}
                    </Section>
                    <Section>
                        <code style={{ textTransform: 'uppercase' }}>
                            {datum.type}
                        </code>
                        <p>{DataType.getDescription(datum)}</p>
                    </Section>
                    <Section>
                        <Button
                            fullWidth
                            onClick={handleDelete}
                            backgroundColor="var(--color-red-500)"
                            data-tour="data-delete-datum-button"
                            data-telemetry-id="datum-overlay-delete-datapoint"
                            disabled={isDeleted}
                        >
                            Delete this data point
                        </Button>
                        {/* <Button
                            fullWidth
                            onClick={handleModify}
                            backgroundColor="var(--color-yellow-500)"
                        >
                            Modify this data point
                        </Button> */}
                    </Section>
                </>
            )}
        </RightSideOverlay>
    );
};

export default DatumOverlay;