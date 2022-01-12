import React, { useCallback } from 'react';
import { GhostButton } from 'app/components/Button';
import { ProvidedDataTypes } from "main/providers/types/Data";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faClock, faLink, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontLarge, H2 } from 'app/components/Typography';
import DataType from 'app/utilities/DataType';
import Providers from 'app/utilities/Providers';
import RightSideOverlay, { DetailListItem, Section } from 'app/components/RightSideOverlay';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { RouteProps } from 'app/screens/types';
import { State, useAppDispatch } from 'app/store';
import { deleteDatum } from 'app/store/data/actions';
import { useSelector } from 'react-redux';
import IconBadge from 'app/components/IconBadge';
import { PullContainer } from 'app/components/Utility';

interface Props {
    datumId: number;
}

const DatumOverlay = ({ datumId }: Props): JSX.Element => {
    const { byKey, deleted } = useSelector((state: State) => state.data);
    const datum = datumId && byKey[datumId];
    const isDeleted = datumId && deleted.includes(datumId);

    // Create handler that redirects the page if the overlay is closed
    const { category } = useParams<RouteProps['data']>();
    const navigate = useNavigate();
    const location = useLocation();
    const handleClose = useCallback(() => {
        if (location.pathname.startsWith('/data')){
            navigate(`/data/${category}`);
        } else if (location.pathname.startsWith('/graph')) {
            navigate('/graph');
        }
    }, [navigate, category, location]);

    // Create handler for deleting data points
    const dispatch = useAppDispatch();
    const handleDelete = useCallback(() => {
        dispatch(deleteDatum(datumId));
    }, [dispatch, datumId]);

    return (
        <RightSideOverlay onClose={handleClose} data-tour="data-datum-overlay">
            {datum && (
                <>
                    <Section>
                        <PullContainer verticalAlign>
                            <IconBadge icon={DataType.getIcon(datum.type as ProvidedDataTypes)} />
                            <H2>{DataType.toString(datum)}</H2>
                        </PullContainer>
                        {isDeleted && <p>
                            This data point is marked for erasure    
                        </p>}
                    </Section>
                    <Section well>
                        <FontLarge>

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
                                    <FontAwesomeIcon icon={faFile} fixedWidth />
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
                        </FontLarge>
                    </Section>
                    <Section>
                        <code style={{ textTransform: 'uppercase' }}>
                            {datum.type}
                        </code>
                        <p>{DataType.getDescription(datum)}</p>
                    </Section>
                    <Section>
                        <GhostButton
                            fullWidth
                            onClick={handleDelete}
                            backgroundColor="red"
                            data-tour="data-delete-datum-button"
                            data-telemetry-id="datum-overlay-delete-datapoint"
                            disabled={isDeleted}
                            icon={faTrash}
                        >
                            Delete this data point
                        </GhostButton>
                        {/* <Button
                            fullWidth
                            onClick={handleModify}
                            backgroundColor="yellow"
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