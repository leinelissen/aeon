import { createAsyncThunk } from '@reduxjs/toolkit';
import Email from 'app/utilities/Email';

export const fetchAccounts = createAsyncThunk(
    'email/accounts/fetch',
    () => Email.getAccounts()
);

export const fetchClients = createAsyncThunk(
    'email/clients/fetch',
    () => Email.getClients()
);

export const createNewAccount = createAsyncThunk(
    'email/accounts/create',
    (client: string) => Email.initialise(client)
);