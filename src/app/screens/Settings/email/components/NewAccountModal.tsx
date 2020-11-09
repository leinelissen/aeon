import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from 'app/assets/fa-light';
import Button from 'app/components/Button';
import Modal from 'app/components/Modal';
import ModalMenu from 'app/components/Modal/Menu';
import { Margin, MarginLeft, PullCenter, PullContainer } from 'app/components/Utility';
import { useAppDispatch } from 'app/store';
import { createNewAccount } from 'app/store/email/actions';
import React, { PropsWithChildren, useCallback, useState } from 'react';

type NewAccountProps = PropsWithChildren<{ 
    client: string, 
    children: string
}>;

function NewAccountButton({ client, children, ...props }: NewAccountProps): JSX.Element {
    const [isActive, setActive] = useState(false);
    const dispatch = useAppDispatch();

    const handleClick = useCallback(async () => {
        setActive(true);
        await dispatch(createNewAccount(client));
        setActive(false);
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
                        <p>By connecting your Gmail account, Aeon can send and check emails on your behalf. This makes it easier to submit and check on data requests.</p>
                        <PullCenter><NewAccountButton client='gmail'>Add new Gmail account</NewAccountButton></PullCenter>
                    </Margin>
                    {/* <Margin>SMTP</Margin> */}
                </ModalMenu>
            </Modal>
        </>
    );
}

export default NewAccountModal;