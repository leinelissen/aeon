import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { faPlus } from 'app/assets/fa-light';
import Button from 'app/components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'app/components/Modal';
import ModalMenu from 'app/components/Modal/Menu';
import { PullContainer, MarginLeft, Margin, PullCenter } from 'app/components/Utility';
import { addProviderAccount } from 'app/store/accounts/actions';
import { State, useAppDispatch } from 'app/store';
import { useSelector } from 'react-redux';
import Providers from 'app/utilities/Providers';
import { Dropdown, Label, TextInput } from 'app/components/Input';
import { InitOptionalParameters } from 'main/providers/types';
import isValidUrl from 'app/utilities/isValidUrl';
import { useNavigate, useLocation } from 'react-router-dom';
import EmailProvider from './EmailProvider';
import useTour from 'app/components/Tour/useTour';

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
    useTour('/screen/accounts/new-account');
    const location = useLocation();
    const navigate = useNavigate();

    // Selectors
    const { allProviders, availableProviders} = useSelector((state: State) => state.accounts);
    const emailAccounts = useSelector((state: State) => state.email.accounts.all);
    
    // If demo mode is activated, we insert a dummy 'email' provider option,
    // which theoretically can be used to automatically send emails to
    // providers, but as of yet is not working. Lets call it Wizard of Oz.
    const all = window.api.env.DEMO_MODE
        ? [...allProviders, 'email']
        : allProviders;

    // State    
    const [modalIsOpen, setModal] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(emailAccounts.length ? emailAccounts[0] : '');
    const [selectedUrl, setSelectedUrl] = useState('');

    // Handlers
    const closeModal = useCallback(() => {
        navigate(location.pathname)
    }, [location]);

    const openModal = useCallback(() => { 
        navigate(location.pathname + '?create-new-account')
    }, [location]);

    const handleUrlChange = useCallback((event) => { 
        setSelectedUrl(event.target.value)
    }, [setSelectedUrl]);
    
    // Make whether the modal is open dependent on the query parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setModal(params.has('create-new-account'));
    }, [location, setModal]);
    
    // Redirect a user to the Create New Email Account modal, when they select
    // the option from the email accounts dropdown
    useEffect(() => {
        if (selectedEmail === 'Create New Email Account...') {
            navigate('/settings/email-accounts?create-new-email-account');
            setSelectedEmail(emailAccounts.length ? emailAccounts[0] : '');
        }
    }, [selectedEmail, setSelectedEmail, navigate]);
    
    return (
        <>
            <Button fullWidth icon={faPlus} onClick={openModal} data-tour="accounts-create-account">
                Add new account
            </Button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <ModalMenu labels={all.map((key) =>
                    <PullContainer verticalAlign key={key} data-tour={`accounts-create-account-${key}`}>
                        <FontAwesomeIcon icon={Providers.getIcon(key)} />
                        <MarginLeft>{key.replace(/(-|_)/g, ' ')}</MarginLeft>
                    </PullContainer>
                )}>
                    {all.map((key) => key === 'email' ? 
                        <EmailProvider key="email" />
                        : (
                            <Margin key={key}>
                                {key !== 'email' && key !== 'open-data-rights'
                                    ? <p>By adding a new account for {key}, you are able to retrieve your data from them.</p>
                                    : <p>With this option, you are requesting your data for another organisation that is served by this method.</p>}
                                {key !== 'email' 
                                    ? <p>When you create a new account, a window will pop up asking for your credentials. Aeon will never store your credentials. Rather, when you log in, Aeon can hijack the window to perform actions on your behalf. These actions are limited to doing data requests for you.</p> 
                                    : null}
                                {availableProviders[key].requiresEmail &&
                                <>
                                    <p>In order to use this provider, you must link an email address to Aeon. Selected a previously linked email address in the list below or link one first.</p>
                                    <Dropdown 
                                        options={[...emailAccounts, 'Create New Email Account...']}
                                        label="Email Account" 
                                        value={selectedEmail}
                                        onSelect={setSelectedEmail}
                                        placeholder="Please select an email account"
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