import React, { useCallback } from 'react';
import Button from 'app/components/Button';
import { ProviderDatum, ProvidedDataTypes } from 'main/providers/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCassetteTape, faClock, faHashtag, faEye } from 'app/assets/fa-light';
import { H2 } from 'app/components/Typography';
import DataType from 'app/utilities/DataType';
import Providers from 'app/utilities/Providers';
import theme from 'app/styles/theme';
import RightSideOverlay, { DetailListItem, Section } from 'app/components/RightSideOverlay';
import { useHistory, useParams } from 'react-router-dom';
import { RouteProps } from 'app/screens/types';

interface Props {
    datum: ProviderDatum<unknown, unknown>;
    onDelete?: () => void;
    onModify?: () => void;
}

const DatumOverlay = (props: Props): JSX.Element => {
    const { 
        onDelete: handleDelete,
        datum 
    } = props;

    // Create handler that redirects the page if the overlay is closed
    const { category } = useParams<RouteProps['data']>();
    const history = useHistory();
    const handleClose = useCallback(() => {
        history.push(`/data/${category}`);
    }, [history, category]);

    return (
        <RightSideOverlay onClose={handleClose} columnPosition={3}>
            {datum && (
                <>
                    <Section>
                        <H2>
                            <FontAwesomeIcon
                                icon={DataType.getIcon(datum.type as ProvidedDataTypes)}
                                style={{ marginRight: 8 }}
                            />
                            {DataType.toString(datum)}
                        </H2>
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
                                {datum.provider}
                            </span>
                        </DetailListItem>
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
                        <DetailListItem>
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
                        </DetailListItem>
                    </Section>
                    <Section>
                        <Button
                            fullWidth
                            onClick={handleDelete}
                            backgroundColor={theme.colors.red}
                            data-telemetry-id="datum-overlay-delete-datapoint"
                        >
                            Delete this data point
                        </Button>
                        {/* <Button
                            fullWidth
                            onClick={handleModify}
                            backgroundColor={theme.colors.yellow}
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