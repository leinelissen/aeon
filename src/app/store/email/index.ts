import { createSlice } from '@reduxjs/toolkit';
import { createEmailAccount, fetchEmailAccounts, fetchEmailClients } from './actions';

interface EmailState {
    clients: string[];
    accounts: {
        byId: Record<string, string>,
        all: string[]
    },
    isLoading: {
        newAccount: boolean;
    }
}

const initialState: EmailState = {
    clients: [],
    accounts: {
        byId: {},
        all: [],
    },
    isLoading: {
        newAccount: false,
    },
};

const emailSlice = createSlice({
    name: 'email',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchEmailAccounts.fulfilled, (state, action) => {
            state.accounts.byId = action.payload;
            state.accounts.all = Object.keys(action.payload);
        });
        builder.addCase(fetchEmailClients.fulfilled, (state, action) => {
            state.clients = action.payload;
        });
        builder.addCase(createEmailAccount.pending, (state) => { state.isLoading.newAccount = true; });
        builder.addCase(createEmailAccount.fulfilled, (state) => { state.isLoading.newAccount = false; });
    },
});

export default emailSlice.reducer;