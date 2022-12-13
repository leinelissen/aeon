import React, { ChangeEvent, useCallback, useState } from 'react';
import { Label, TextInput } from 'app/components/Input';
import Button from 'app/components/Button';
import { PullContainer } from 'app/components/Utility';
import { createImapAccount, testImapConnection } from 'app/store/email/actions';
import { useAppDispatch } from 'app/store';
import styled from 'styled-components';

const ErrorMessage = styled.div`
    background-color: var(--color-red-100);
    color: var(--color-red-600);;
    padding: 8px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
`;

interface Props {
    onComplete: () => void;
}

function ImapInitialiser({ onComplete }: Props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState(993);

    const [hasTested, setHasTested] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    const handleChangeUsername = useCallback((e: ChangeEvent<HTMLInputElement>) => { 
        setUsername(e.currentTarget.value); 
        setHasTested(null);
    }, [setUsername]);
    const handleChangePassword = useCallback((e: ChangeEvent<HTMLInputElement>) => { 
        setPassword(e.currentTarget.value); 
        setHasTested(null);
    }, [setPassword]);
    const handleChangeHost = useCallback((e: ChangeEvent<HTMLInputElement>) => { 
        setHost(e.currentTarget.value); 
        setHasTested(null);
    }, [setHost]);
    const handleChangePort = useCallback((e: ChangeEvent<HTMLInputElement>) => { 
        setPort(Number.parseInt(e.currentTarget.value)); 
        setHasTested(null);
    }, [setPort]);

    const testConnection = useCallback(() => {
        setHasTested(null);
        setIsLoading(true);
        dispatch(testImapConnection({
            user: username,
            pass: password,
            host,
            port,
            secure: true,
        })).unwrap().then((result) => {
            if (result === true) {
                dispatch(createImapAccount({
                    user: username,
                    pass: password,
                    host,
                    port,
                    secure: true,
                })).unwrap().then(onComplete);
            } else {
                setHasTested(result);
                setIsLoading(false);
            }
        });
    }, [username, password, host, port]);

    return (
        <>
            <p>Using IMAP, you can add any regular email address to Aeon. After filling in your details, Aeon will test the connection to make sure your credentials are correct.</p>
            <Label>
                Email Address
                <TextInput value={username} onChange={handleChangeUsername} placeholder="john@doe.com" />
            </Label>
            <Label>
                Password
                <TextInput value={password} onChange={handleChangePassword} type="password" />
            </Label>
            <Label>
                Host
                <TextInput value={host} onChange={handleChangeHost} placeholder="imap.doe.com" />
            </Label>
            <Label>
                Port
                <TextInput value={port} onChange={handleChangePort} />
            </Label>
            {hasTested === false && (
                <ErrorMessage>Failed to connect to {host}</ErrorMessage>
            )}
            <PullContainer gap>
                <Button onClick={testConnection} loading={isLoading}>Add {username}</Button>
            </PullContainer>
        </>
    );
}

export default ImapInitialiser;
