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
import { Dropdown } from 'app/components/Input';

type NewAccountProps = PropsWithChildren<{ 
    client: string, 
    onComplete: () => void,
    disabled?: boolean;
    selectedEmail?: string;
}>;

function NewAccountButton({ client, children, onComplete, ...props }: NewAccountProps): JSX.Element {
    const [isActive, setActive] = useState(false);
    const dispatch = useAppDispatch();

    // A handler for creating a new email account
    const handleClick = useCallback(async () => {
        // Set activity flag
        setActive(true);

        // Actually create a new account
        await dispatch(addProviderAccount({ client, account }));

        // Set new activity flag, and let parent component know we're done
        setActive(false);
        onComplete();
    }, [dispatch, client, setActive])

    return (
        <Button icon={faPlus} {...props} onClick={handleClick} loading={isActive}>{children}</Button>
    )
}

function NewAccountModal(): JSX.Element {
    const allProviders = useSelector((state: State) => state.requests.allProviders);
    const availableProviders = useSelector((state: State) => state.requests.availableProviders);
    const emailAccounts = useSelector((state: State) => state.email.accounts.all);
    const [modalIsOpen, setModal] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(emailAccounts.length ? emailAccounts[0] : '');
    const openModal = useCallback(() => setModal(true), [setModal]);
    const closeModal = useCallback(() => setModal(false), [setModal]);
    
    return (
        <>
            <Button fullWidth icon={faPlus} onClick={openModal}>
                Add new account
            </Button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <ModalMenu labels={allProviders.map((key) =>
                    <PullContainer verticalAlign key={key}><FontAwesomeIcon icon={Providers.getIcon(key)} /><MarginLeft>{key}</MarginLeft></PullContainer>
                )}>
                    {allProviders.map((key) => (
                        <Margin key={key}>
                            <p>By adding a new account for {key}, you are able to retrieve your data from them.</p>
                            {availableProviders[key].requiresEmail &&
                                <>
                                    <p>In order to use this provider, you must link an email address to Aeon. </p>
                                    <Dropdown 
                                        options={emailAccounts}
                                        label="Email Account" 
                                        value={selectedEmail}
                                        onSelect={setSelectedEmail}
                                        disabled={emailAccounts.length === 0}
                                    />
                                </>
                            }
                            <PullCenter>
                                <NewAccountButton
                                    client={key}
                                    emailAccount={selectedEmail}
                                    onComplete={closeModal}
                                    disabled={availableProviders[key].requiresEmail && selectedEmail === ''}
                                >
                                    Add new account
                                </NewAccountButton>
                            </PullCenter>
                        </Margin>
                    ))}
                </ModalMenu>
            </Modal>
        </>
    );
}

export default NewAccountModal;