import { createSlice } from '@reduxjs/toolkit';
import { InitialisedProvider } from 'main/providers/types';
import { fetchAvailableProviders, fetchProviderAccounts, refreshRequests } from './actions';

interface RequestsState {
    byKey: Record<string, InitialisedProvider>;
    all: string[];
    allProviders: string[];
    availableProviders: Record<string, { requiresEmail: boolean }>;
    isLoading: {
        requests: boolean;
        refresh: boolean;
    }
}

const initialState: RequestsState = {
    byKey: {},
    all: [],
    allProviders: [],
    availableProviders: {},
    isLoading: {
        requests: false,
        refresh: false,
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
            console.log(action);
            state.allProviders = Object.keys(action.payload);
            state.availableProviders = action.payload;
        });
    }
});

export default requestsSlice.reducer;