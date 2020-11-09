import { createSlice } from '@reduxjs/toolkit';
import { DataRequestStatus } from 'main/providers/types';
import { fetchRequests, refreshRequests } from './actions';

interface RequestsState {
    byKey: Record<string, DataRequestStatus>;
    allKeys: string[];
    isLoading: {
        requests: boolean;
        refresh: boolean;
    }
}

const initialState: RequestsState = {
    byKey: {},
    allKeys: [],
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
        builder.addCase(fetchRequests.pending, state => { state.isLoading.requests = true });
        builder.addCase(fetchRequests.rejected, state => { state.isLoading.requests = false });
        builder.addCase(fetchRequests.fulfilled, (state, action) => { 
            state.isLoading.requests = false;
            state.byKey = action.payload.dispatched;
            state.allKeys = action.payload.providers;
        });
    }
});

export default requestsSlice.reducer;