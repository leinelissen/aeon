import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from 'app/assets/fa-light';
import Button, { LinkButton } from 'app/components/Button';
import Modal from 'app/components/Modal';
import ModalMenu from 'app/components/Modal/Menu';
import { PullContainer, MarginLeft, MarginSmall } from 'app/components/Utility';
import { State } from 'app/store';
import Providers from 'app/utilities/Providers';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import generateEmail from './generateEmail';

const ScrollContainer = styled.div`
    background-color: #f6f6f6;
    font-family: 'IBM Plex Mono';
    max-height: 40vh;
    overflow: auto;
    padding: 16px;
    font-size: 12px;
    white-space: pre-line;
`;

function ErasureEmails(): JSX.Element {
    const history = useHistory();
    const { byKey, deletedByProvider } = useSelector((state: State) => state.data);

    // Redirect to timeline on menu item close
    const handleClose = useCallback(() => {
        history.push('/timeline');
    }, [history]);

    return (
        <Modal isOpen onRequestClose={handleClose}>
            <ModalMenu labels={Object.keys(deletedByProvider).map((key) =>
                <PullContainer verticalAlign key={key}>
                    <FontAwesomeIcon icon={Providers.getIcon(key)} />
                    <MarginLeft>{key.replace(/(-|_)/g, ' ')}</MarginLeft>
                </PullContainer>
            )}>
                {Object.keys(deletedByProvider).map(provider => {
                    const data = deletedByProvider[provider].map(key => byKey[key]);
                    const email = generateEmail(data, provider);

                    return (
                        <>
                            {/* <MarginSmall key={provider}>
                                <p>Send out the following email:</p>
                            </MarginSmall>     */}
                            <ScrollContainer>
                                {email}
                            </ScrollContainer>
                            <MarginSmall>
                                <Button
                                    icon={faEnvelope}
                                    fullWidth
                                    onClick={() => window.api.openExternalLink(`mailto:privacy@facebook.com?subject=Request for Erasure&body=${encodeURIComponent(email)}`)}
                                >
                                    Send in e-mail client
                                </Button>
                            </MarginSmall>
                        </>
                    );
                })}
            </ModalMenu>
        </Modal>
    )
}

export default ErasureEmails;