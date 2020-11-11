import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from 'app/assets/fa-light';
import Button from 'app/components/Button';
import Modal from 'app/components/Modal';
import ModalMenu from 'app/components/Modal/Menu';
import { Margin, MarginLeft, PullCenter, PullContainer } from 'app/components/Utility';
import { useAppDispatch } from 'app/store';
import { createEmailAccount } from 'app/store/email/actions';
import React, { PropsWithChildren, useCallback, useState } from 'react';

type NewAccountProps = PropsWithChildren<{ 
    client: string, 
    onComplete: () => void,
}>;

function NewAccountButton({ client, children, onComplete, ...props }: NewAccountProps): JSX.Element {
    const [isActive, setActive] = useState(false);
    const dispatch = useAppDispatch();

    // A handler for creating a new email account
    const handleClick = useCallback(async () => {
        // Set activity flag
        setActive(true);

        // Actually create a new account
        await dispatch(createEmailAccount(client));

        // Set new activity flag, and let parent component know we're done
        setActive(false);
        onComplete();
    }, [dispatch, client, setActive])

    return (
        <Button icon={faPlus} {...props} onClick={handleClick} loading={isActive}>{children}</Button>
    )
}

function NewAccountModal(): JSX.Element {
    const [modalIsOpen, setModal] = useState(false);
    const openModal = useCallback(() => setModal(true), [setModal]);
    const closeModal = useCallback(() => setModal(false), [setModal]);
    
    return (
        <>
            <Button fullWidth icon={faPlus} onClick={openModal}>Add Email Account</Button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <ModalMenu labels={[
                    <PullContainer verticalAlign key='google'><FontAwesomeIcon icon={faGoogle} /><MarginLeft>Gmail</MarginLeft></PullContainer>, 
                    // <PullContainer verticalAlign key='smtp'><FontAwesomeIcon icon={faEnvelope} /><MarginLeft>SMTP</MarginLeft></PullContainer>,
                ]}>
                    <Margin>
                        <p>By connecting your Gmail account, Aeon can send and check emails on your behalf. This makes it easier to submit and check on data requests. When clicking the button below, a browser window will open that allows you to connect to a particular Gmail account. </p>
                        <PullCenter><NewAccountButton client='gmail' onComplete={closeModal}>Add new Gmail account</NewAccountButton></PullCenter>
                    </Margin>
                    {/* <Margin>SMTP</Margin> */}
                </ModalMenu>
            </Modal>
        </>
    );
}

export default NewAccountModal;