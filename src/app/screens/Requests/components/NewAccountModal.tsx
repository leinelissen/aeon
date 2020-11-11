import React, { PropsWithChildren, useCallback, useState } from 'react';
import { faPlus } from 'app/assets/fa-light';
import Button from 'app/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'app/components/Modal';
import ModalMenu from 'app/components/Modal/Menu';
import { PullContainer, MarginLeft, Margin, PullCenter } from 'app/components/Utility';
import { addProviderAccount } from 'app/store/requests/actions';
import { State, useAppDispatch } from 'app/store';
import { useSelector } from 'react-redux';
import Providers from 'app/utilities/Providers';

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
        await dispatch(addProviderAccount({ client }));

        // Set new activity flag, and let parent component know we're done
        setActive(false);
        onComplete();
    }, [dispatch, client, setActive])

    return (
        <Button icon={faPlus} {...props} onClick={handleClick} loading={isActive}>{children}</Button>
    )
}

function NewAccountModal(): JSX.Element {
    const availableProviders = useSelector((state: State) => state.requests.availableProviders);
    const [modalIsOpen, setModal] = useState(false);
    const openModal = useCallback(() => setModal(true), [setModal]);
    const closeModal = useCallback(() => setModal(false), [setModal]);
    
    return (
        <>
            <Button fullWidth icon={faPlus} onClick={openModal}>
                Add new account
            </Button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <ModalMenu labels={availableProviders.map((key) =>
                    <PullContainer verticalAlign key={key}><FontAwesomeIcon icon={Providers.getIcon(key)} /><MarginLeft>{key}</MarginLeft></PullContainer>
                )}>
                    {availableProviders.map((key) => (
                        <Margin key={key}>
                            <p>By adding a new account for {key}, you are able to retrieve your data from them.</p>
                            <PullCenter><NewAccountButton client={key} onComplete={closeModal}>Add new account</NewAccountButton></PullCenter>
                        </Margin>
                    ))}
                </ModalMenu>
            </Modal>
        </>
    );
}

export default NewAccountModal;