import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Commit, ExtractedDataDiff } from 'main/lib/repository/types';

interface NewCommit extends Commit {
    diff: ExtractedDataDiff
}

type NewCommitState = NewCommit[];

export const newCommitsSlice = createSlice({
    name: 'newCommit',
    initialState: [] as NewCommitState,
    reducers: {
        add(state, action: PayloadAction<NewCommit>) {
            state.unshift(action.payload);
        }
    }
});

export default newCommitsSlice.reducer;