import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingState {
    initialisation: boolean;
    log: boolean;
    newCommit: boolean;
}

const initialState: OnboardingState = {
    initialisation: false,
    log: false,
    newCommit: false,
};

export const onboardingSlice = createSlice({
    name: 'onboardingComplete',
    initialState,
    reducers: {
        complete(state, action: PayloadAction<keyof OnboardingState>) {
            state[action.payload] = true;
        }
    }
});

export default onboardingSlice.reducer;