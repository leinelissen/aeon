import { createAsyncThunk } from '@reduxjs/toolkit';
import Providers from 'app/utilities/Providers';
import { InitOptionalParameters } from 'main/providers/types';

export const fetchProviderAccounts = createAsyncThunk(
    'requests/fetch/accounts',
    () => Providers.getAccounts()
)

export const refreshRequests = createAsyncThunk(
    'requests/refresh',
    async (arg, { dispatch }) => {
        await Providers.refresh();
        await dispatch(fetchProviderAccounts());
    }
)

export const addProviderAccount = createAsyncThunk(
    'requests/new-account',
    ({ client, optionalParameters }: { client: string, optionalParameters: InitOptionalParameters }, { dispatch }) => {
        const value = Providers.initialise(client, optionalParameters);
        dispatch(fetchProviderAccounts());
        return value;
    }
)

export const fetchAvailableProviders = createAsyncThunk(
    'requests/fetch/providers',
    () => Providers.getAvailableProviders(),
)