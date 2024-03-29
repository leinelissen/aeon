import { createSlice } from '@reduxjs/toolkit';
import { ProvidedDataTypes, ProviderDatum } from 'main/providers/types/Data';
import { deleteDatum, fetchParsedCommit, resetDeletedData } from './actions';

interface DataState {
    all: number[];
    byKey: ProviderDatum<unknown, unknown>[];
    byType: Record<ProvidedDataTypes, number[]>;
    deletedByType: Record<ProvidedDataTypes, number[]>;
    deletedByProvider: Record<string, number[]>;
    deleted: number[];
    isLoading: boolean;
}

const byType = Object.values(ProvidedDataTypes).reduce<DataState['byType']>((sum, key) => {
    sum[key] = [];
    return sum;
}, {} as DataState['byType']);

const initialState: DataState = {
    all: [],
    byKey: [],
    byType,
    deletedByType: byType,
    deletedByProvider: {},
    deleted: [],
    isLoading: false,
};

const data = createSlice({
    name: 'data',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchParsedCommit.pending, (state) => { state.isLoading = true; });
        builder.addCase(fetchParsedCommit.rejected, (state) => { state.isLoading = false; });
        builder.addCase(fetchParsedCommit.fulfilled, (state, action) => { 
            state.isLoading = false;

            // Unfortunately, as data points might change when a new update is
            // coming in, we cannot retain deleted data points across parsed
            // commits. Thus we reset the entire state every time a new parsed
            // commit comes in
            Object.values(ProvidedDataTypes).map((type) => {
                state.byType[type] = [];
                state.deletedByType[type] = []; 
            });
            state.deletedByProvider = {};
            state.deleted = [];

            // Then assign the payload directly to the state
            state.all = Array.from(action.payload.keys());
            state.byKey = action.payload;

            // Then loop through all data points
            action.payload.forEach((datum, i): void => {
                // And push the key for each datum type to the byType array
                state.byType[datum.type as ProvidedDataTypes].push(i);
            }, {});
        });
        builder.addCase(deleteDatum, (state, action) => {
            const datum = state.byKey[action.payload];

            // Add the deleted datum to the list for deleted items
            state.deleted.push(action.payload);

            // Also add it to the list for deleted types
            state.deletedByType[datum.type as ProvidedDataTypes].push(action.payload);
            
            // Also add it to the list sorted by provider
            if (!(datum.provider in state.deletedByProvider)) {
                state.deletedByProvider[datum.provider] = [];
            }
            state.deletedByProvider[datum.provider].push(action.payload);
        });
        builder.addCase(resetDeletedData, (state) => {
            state.deleted = [];
            state.deletedByType = initialState.deletedByType;
            state.deletedByProvider = {};
        });
    },
});

export default data.reducer;