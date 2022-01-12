import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import Providers from 'app/utilities/Providers';
import { InitOptionalParameters } from 'main/providers/types';
import { EmailProvider } from './types';

export const fetchProviderAccounts = createAsyncThunk(
    'requests/fetch/accounts',
    Providers.getAccounts,
);

export const refreshRequests = createAsyncThunk(
    'requests/refresh',
    async (arg, { dispatch }) => {
        await Providers.refresh();
        await dispatch(fetchProviderAccounts());
    },
);

export const addProviderAccount = createAsyncThunk(
    'requests/new-account',
    ({ client, optionalParameters }: { client: string, optionalParameters: InitOptionalParameters }, { dispatch }) => {
        const value = Providers.initialise(client, optionalParameters);
        dispatch(fetchProviderAccounts());
        return value;
    },
);

export const fetchAvailableProviders = createAsyncThunk(
    'requests/fetch/providers',
    Providers.getAvailableProviders,
);

export const createEmailAccount = createAction<EmailProvider>(
    'requests/new-email-account',
);

export const dispatchEmailRequest = createAction<string>(
    'requests/email/dispatch',
);