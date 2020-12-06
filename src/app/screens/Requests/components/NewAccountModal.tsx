import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
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
import { Dropdown, Label, TextInput } from 'app/components/Input';
import { InitOptionalParameters } from 'main/providers/types';
import isValidUrl from 'app/utilities/isValidUrl';
import { useHistory } from 'react-router-dom';

type NewAccountProps = PropsWithChildren<{ 
    client: string, 
    onComplete: () => void,
    disabled?: boolean;
    optionalParameters: InitOptionalParameters;
    selectedEmail?: string;
}>;

function NewAccountButton({ client, children, onComplete, optionalParameters, ...props }: NewAccountProps): JSX.Element {
    const [isActive, setActive] = useState(false);
    const dispatch = useAppDispatch();

    // A handler for creating a new email account
    const handleClick = useCallback(async () => {
        // Set activity flag
        setActive(true);

        // Actually create a new account
        await dispatch(addProviderAccount({ client, optionalParameters }));

        // Set new activity flag, and let parent component know we're done
        setActive(false);
        onComplete();
    }, [dispatch, client, setActive, optionalParameters]);

    return (
        <Button icon={faPlus} {...props} onClick={handleClick} loading={isActive}>{children}</Button>
    )
}

function NewAccountModal(): JSX.Element {
    const history = useHistory();
    const allProviders = useSelector((state: State) => state.requests.allProviders);
    const availableProviders = useSelector((state: State) => state.requests.availableProviders);
    const emailAccounts = useSelector((state: State) => state.email.accounts.all);
    const [modalIsOpen, setModal] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(emailAccounts.length ? emailAccounts[0] : '');
    const [selectedUrl, setSelectedUrl] = useState('');
    const openModal = useCallback(() => setModal(true), [setModal]);
    const closeModal = useCallback(() => setModal(false), [setModal]);
    const handleUrlChange = useCallback((event) => setSelectedUrl(event.target.value), [setSelectedUrl]);
    
    // Redirect a user to the Create New Email Account modal, when they select
    // the option from the email accounts dropdown
    useEffect(() => {
        if (selectedEmail === 'Create New Email Account...') {
            history.push('/settings/email-accounts?create-new-email-account');
            setSelectedEmail(emailAccounts.length ? emailAccounts[0] : '');
        }
    }, [selectedEmail, setSelectedEmail, history]);
    
    return (
        <>
            <Button fullWidth icon={faPlus} onClick={openModal}>
                Add new account
            </Button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <ModalMenu labels={allProviders.map((key) =>
                    <PullContainer verticalAlign key={key}><FontAwesomeIcon icon={Providers.getIcon(key)} /><MarginLeft>{key.replace(/(-|_)/g, ' ')}</MarginLeft></PullContainer>
                )}>
                    {allProviders.map((key) => (
                        <Margin key={key}>
                            <p>By adding a new account for {key}, you are able to retrieve your data from them.</p>
                            <p>When you create a new account, a window will pop up asking for your credentials. Aeon will never store your credentials. Rather, when you log in, Aeon can hijack the window to perform actions on your behalf. These actions are limited to doing data requests for you.</p>
                            {availableProviders[key].requiresEmail &&
                                <>
                                    <p>In order to use this provider, you must link an email address to Aeon. </p>
                                    <Dropdown 
                                        options={[...emailAccounts, 'Create New Email Account...']}
                                        label="Email Account" 
                                        value={selectedEmail}
                                        onSelect={setSelectedEmail}
                                        disabled={emailAccounts.length === 0}
                                    />
                                </>
                            }
                            {availableProviders[key].requiresUrl &&
                                <>
                                    <p>This provider allows you to get data from any organisation that supports the Open Data Rights API. Please enter the URL for the organisation:</p>
                                    <Label>
                                        <span>Open Data Rights API URL</span>
                                        <TextInput 
                                            value={selectedUrl}
                                            onChange={handleUrlChange}
                                            placeholder="https://open-data.acme-corp.com"
                                            type="url"
                                        />
                                    </Label>
                                </>
                            }
                            <PullCenter>
                                <NewAccountButton
                                    client={key}
                                    optionalParameters={{
                                        accountName: availableProviders[key].requiresEmail ? selectedEmail : undefined,
                                        apiUrl: availableProviders[key].requiresUrl ? selectedUrl : undefined
                                    }}
                                    onComplete={closeModal}
                                    disabled={
                                        availableProviders[key].requiresEmail && selectedEmail === ''
                                        || availableProviders[key].requiresUrl && !isValidUrl(selectedUrl)
                                    }
                                >
                                    Add new {key.replace(/(-|_)/g, ' ')} account
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