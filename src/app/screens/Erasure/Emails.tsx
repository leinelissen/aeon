import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Button from 'app/components/Button';
import Modal from 'app/components/Modal';
import ModalMenu from 'app/components/Modal/Menu';
import { PullContainer, MarginLeft, MarginSmall } from 'app/components/Utility';
import { State } from 'app/store';
import Providers from 'app/utilities/Providers';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import generateEmail from './generateEmail';

const ScrollContainer = styled.div`
    background-color: var(--color-gray-200);
    font-family: 'IBM Plex Mono';
    max-height: 40vh;
    overflow: auto;
    padding: 16px;
    font-size: 12px;
    white-space: pre-line;
`;

function ErasureEmails(): JSX.Element {
    const navigate = useNavigate();
    const { byKey, deletedByProvider } = useSelector((state: State) => state.data);

    // Redirect to timeline on menu item close
    const handleClose = useCallback(() => {
        navigate('/timeline');
    }, [navigate]);

    return (
        <Modal isOpen onRequestClose={handleClose}>
            <ModalMenu labels={Object.keys(deletedByProvider).map((key) =>
                <PullContainer verticalAlign key={key}>
                    <FontAwesomeIcon icon={Providers.getIcon(key)} />
                    <MarginLeft>{key.replace(/(-|_)/g, ' ')}</MarginLeft>
                </PullContainer>,
            )}>
                {Object.keys(deletedByProvider).map((provider) => {
                    const data = deletedByProvider[provider].map((key) => byKey[key]);
                    const email = generateEmail(data, provider);

                    return (
                        <>
                            <ScrollContainer>
                                {email}
                            </ScrollContainer>
                            <MarginSmall>
                                <Button
                                    icon={faEnvelope}
                                    fullWidth
                                    onClick={() => window.api.openEmailClient('privacy@facebook.com', 'Request for Erasure', email)}
                                >
                                    Send in e-mail client
                                </Button>
                            </MarginSmall>
                        </>
                    );
                })}
            </ModalMenu>
        </Modal>
    );
}

export default ErasureEmails;