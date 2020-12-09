import { createSlice } from '@reduxjs/toolkit';
import { InitialisedAccount } from "main/providers/types";
import { createEmailAccount, dispatchEmailRequest, fetchAvailableProviders, fetchProviderAccounts, refreshRequests } from './actions';
import { EmailProvider } from './types';

interface AccountsState {
    byKey: Record<string, InitialisedAccount>;
    all: string[];
    allProviders: string[];
    availableProviders: Record<string, { requiresEmail: boolean, requiresUrl: boolean }>;
    isLoading: {
        requests: boolean;
        refresh: boolean;
    }
    emailProviders: {
        all: string[];
        byKey: Record<string, EmailProvider>;
    }
}

const initialState: AccountsState = {
    byKey: {},
    all: [],
    allProviders: [],
    availableProviders: {},
    isLoading: {
        requests: false,
        refresh: false,
    },
    emailProviders: {
        all: [],
        byKey: {},
    }
}

const requestsSlice = createSlice({
    name: 'requests',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(refreshRequests.pending, state => { state.isLoading.refresh = true });
        builder.addCase(refreshRequests.rejected, state => { state.isLoading.refresh = false });
        builder.addCase(refreshRequests.fulfilled, state => { state.isLoading.refresh = false });
        builder.addCase(fetchProviderAccounts.pending, state => { state.isLoading.requests = true });
        builder.addCase(fetchProviderAccounts.rejected, state => { state.isLoading.requests = false });
        builder.addCase(fetchProviderAccounts.fulfilled, (state, action) => { 
            state.isLoading.requests = false;
            state.byKey = action.payload.accounts;
            state.all = Object.keys(action.payload.accounts);
        });
        builder.addCase(fetchAvailableProviders.fulfilled, (state, action) => {
            state.allProviders = Object.keys(action.payload);
            state.availableProviders = action.payload;
        });
        builder.addCase(createEmailAccount, (state, action) => {
            if (!state.emailProviders.all.includes(action.payload.account)) {
                state.emailProviders.all.push(action.payload.account);
            }
            state.emailProviders.byKey[action.payload.account] = action.payload;
        });
        builder.addCase(dispatchEmailRequest, (state, action) => {
            state.emailProviders.byKey[action.payload].status.dispatched = new Date().toString()
        });
    }
});

export default requestsSlice.reducer;