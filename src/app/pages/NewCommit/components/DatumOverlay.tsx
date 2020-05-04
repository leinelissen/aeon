import React, { useRef, useEffect } from 'react';
import Button, { GhostButton } from 'app/components/Button';
import { ProviderDatum, ProvidedDataTypes } from 'main/providers/types';
import styled from 'styled-components';
import { Transition } from 'react-spring/renderprops'
import { slideProps, SlideDirection } from 'app/components/SlideIn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faCassetteTape, faClock, faHashtag, faEye } from '@fortawesome/pro-light-svg-icons';
import { H5, H2 } from 'app/components/Typography';
import DataType from 'app/utilities/DataType';
import Providers from 'app/utilities/Providers';
import theme from 'app/styles/theme';

interface Props {
    datum: ProviderDatum<unknown, unknown>;
    onClose: () => void;
    onDelete?: () => void;
    onModify?: () => void;
}

const Container = styled.div`
    position: absolute;
    background-color: white;
    z-index: 2;
    grid-column: 3 / 4;
    grid-row: 2 / 3;
    font-size: 14px;
    width: 100%;
    height: 100%;
    padding-top: 16px;
    overflow-y: scroll;
    box-shadow: -1px 0 1px rgba(0,0,0,0.01), 
              -2px 0 2px rgba(0,0,0,0.01), 
              -4px 0 4px rgba(0,0,0,0.01), 
              -8px 0 8px rgba(0,0,0,0.01), 
              -16px 0 16px rgba(0,0,0,0.01), 
              -32px 0 32px rgba(0,0,0,0.01);
`;

export const CloseButton = styled(GhostButton)`
    position: absolute;
    left: 16px;
    top: 8px;
`;

export const Section = styled.div`
    border-bottom: 1px solid #eee;
    padding: 16px 32px;
`;

export const DetailListItem = styled.div`
    opacity: 0.5;
    display: flex;

    & > *:first-child {
        margin-right: 8px;
    }
`;

const DatumOverlay = (props: Props): JSX.Element => {
    const { 
        onClose: handleClose,
        onModify: handleModify,
        onDelete: handleDelete,
        datum 
    } = props;

    return (
        <Transition
            items={datum}
            {...slideProps(SlideDirection.RIGHT)}
        >
            {providedDatum => providedDatum && 
                (props =>
                    <Container style={props}>
                        <Section>
                            <CloseButton onClick={handleClose}>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </CloseButton>
                            <H5>DETAILS</H5>
                            <H2>
                                <FontAwesomeIcon
                                    icon={DataType.getIcon(providedDatum.type as ProvidedDataTypes)}
                                    style={{ marginRight: 8 }}
                                />
                                {DataType.toString(providedDatum)}
                            </H2>
                        </Section>
                        <Section>
                            <DetailListItem>
                                <span>
                                    <FontAwesomeIcon
                                        icon={Providers.getIcon(providedDatum.provider)}
                                        fixedWidth
                                    />
                                </span>
                                <span style={{ textTransform: 'capitalize' }}>
                                    {providedDatum.provider}
                                </span>
                            </DetailListItem>
                            <DetailListItem>
                                <span>
                                    <FontAwesomeIcon icon={faCassetteTape} fixedWidth />
                                </span>
                                <span style={{ textTransform: 'uppercase' }}>
                                    {providedDatum.type}
                                </span>
                            </DetailListItem>
                            {providedDatum.timestamp &&                            
                                <DetailListItem>
                                    <span>
                                        <FontAwesomeIcon icon={faClock} fixedWidth />
                                    </span>
                                    <span>
                                        {providedDatum.timestamp?.toLocaleString()}
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
                    </Container>
                )
            }
        </Transition>
    );
};

export default DatumOverlay;