import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Button, { GhostButton } from 'app/components/Button';
import Modal from 'app/components/Modal';
import { H3 } from 'app/components/Typography';
import { MarginSmall, PullContainer } from 'app/components/Utility';
import { State, useAppDispatch } from 'app/store';
import { resetDeletedData } from 'app/store/data/actions';
import DataType from 'app/utilities/DataType';
import Providers from 'app/utilities/Providers';
import { ProvidedDataTypes } from 'main/providers/types/Data';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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

const ResetButton = styled(GhostButton)`
    margin-left: 8px;
    background-color: transparent;
`;

const ScrollContainer = styled.div`
    background-color: var(--color-red-50);
    font-family: 'IBM Plex Mono';
    max-height: 25vh;
    overflow: auto;
    padding: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
`;

function Erasure(): JSX.Element {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { byKey, deleted, deletedByProvider } = useSelector((state: State) => state.data);

    // Redirect to timeline on menu item close
    const handleClose = useCallback(() => {
        navigate('/timeline');
    }, [navigate]);

    // Redirect to next window if the user wants to delete stuff
    const handleDelete = useCallback(() => {
        navigate('/erasure/emails');
    }, [navigate]);

    // Reset the deleted items, and close the modal
    const handleReset = useCallback(() => {
        dispatch(resetDeletedData());
        handleClose();
    }, [handleClose, dispatch]);

    return (
        <Modal isOpen onRequestClose={handleClose}>
            <MarginSmall><p>You have selected the following data point{deleted.length > 1 ? 's' : ''} for removal</p></MarginSmall>
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
                <p>To actually remove this data from their origins, you must send a request for erasure to the organisation processing it. So long as the organisation is processing this data, it will remain in Aeon.</p>
                <p>When you&apos;re ready to erase these data-points with their respective providers, click the button below. This will generate a seperate email for each source, which will you need to send out yourself.</p>
                <PullContainer center>
                    <Button backgroundColor="red" icon={faTrash} onClick={handleDelete}>
                        Remove {deleted.length} data {deleted.length > 1 ? 'points' : 'point'}
                    </Button>
                    <ResetButton onClick={handleReset}>
                        Reset removed data points
                    </ResetButton>
                </PullContainer>
            </MarginSmall>
        </Modal>
    );
}

export default Erasure;