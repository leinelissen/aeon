import { createAsyncThunk } from '@reduxjs/toolkit';
import Email from 'app/utilities/Email';

export const fetchEmailAccounts = createAsyncThunk(
    'email/accounts/fetch',
    () => Email.getAccounts()
);

export const fetchEmailClients = createAsyncThunk(
    'email/clients/fetch',
    () => Email.getClients()
);

export const createEmailAccount = createAsyncThunk(
    'email/accounts/create',
    (client: string) => Email.initialise(client)
);