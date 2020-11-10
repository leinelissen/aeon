import { createSlice } from '@reduxjs/toolkit';
import { createNewAccount, fetchAccounts, fetchClients } from './actions';

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
    }
}

const emailSlice = createSlice({
    name: 'email',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(fetchAccounts.fulfilled, (state, action) => {
            state.accounts.byId = action.payload;
            state.accounts.all = Object.keys(action.payload);
        });
        builder.addCase(fetchClients.fulfilled, (state, action) => {
            state.clients = action.payload;
        });
        builder.addCase(createNewAccount.pending, (state) => { state.isLoading.newAccount = true })
        builder.addCase(createNewAccount.fulfilled, (state) => { state.isLoading.newAccount = false })
    }
});

export default emailSlice.reducer;