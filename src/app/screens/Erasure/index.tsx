import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from 'app/assets/fa-light';
import Button from 'app/components/Button';
import Modal from 'app/components/Modal';
import { H3 } from 'app/components/Typography';
import { MarginSmall } from 'app/components/Utility';
import { State } from 'app/store';
import theme from 'app/styles/theme';
import DataType from 'app/utilities/DataType';
import Providers from 'app/utilities/Providers';
import { ProvidedDataTypes } from 'main/providers/types/Data';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const IconWrapper = styled.div`
    margin: 0 8px;
`;

const Datum = styled.div`
    display: flex;
`;

const Heading = styled(H3)`
    display: flex;
    font-weight: 600;
`;

const Provider = styled.div`
    margin-bottom: 25px;
`;

const ScrollContainer = styled.div`
    background-color: ${theme.colors.red}10;
    font-family: 'IBM Plex Mono';
    max-height: 25vh;
    overflow: auto;
    padding: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
`;

function Erasure(): JSX.Element {
    const history = useHistory();
    const { byKey, deleted, deletedByProvider } = useSelector((state: State) => state.data);

    // Redirect to timeline on menu item close
    const handleClose = useCallback(() => {
        history.push('/timeline');
    }, [history]);

    // Redirect to next window if the user wants to delete stuff
    const handleDelete = useCallback(() => {
        history.push('/erasure/emails');
    }, [history]);

    return (
        <Modal isOpen onRequestClose={handleClose}>
            <MarginSmall><p>You have selected the following data points for removal:</p></MarginSmall>
            <ScrollContainer>
                {Object.keys(deletedByProvider).map(provider => (
                    <Provider key={provider}>
                        <Heading>
                            <IconWrapper>
                                <FontAwesomeIcon icon={Providers.getIcon(provider)} fixedWidth />
                            </IconWrapper>
                            {provider}
                        </Heading>
                        {deletedByProvider[provider].map(key =>
                            <Datum key={key}>
                                <IconWrapper>
                                    <FontAwesomeIcon icon={DataType.getIcon(byKey[key].type as ProvidedDataTypes)} fixedWidth />
                                </IconWrapper>
                                {DataType.toString(byKey[key])} [{byKey[key].type}]
                            </Datum>    
                        )}
                    </Provider>
                ))}
            </ScrollContainer>
            <MarginSmall>
                <p>When you&apos;re ready to erase these data-points with their respective providers, click the button below. You will need to send out the notices yourself.</p>
                <Button backgroundColor={theme.colors.red} fullWidth icon={faTrash} onClick={handleDelete}>
                    Remove {deleted.length} data {deleted.length > 1 ? 'points' : 'point'}
                </Button>
            </MarginSmall>
        </Modal>
    );
}

export default Erasure;