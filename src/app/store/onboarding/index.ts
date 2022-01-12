import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TourKeys } from 'app/components/Tour/steps';

interface OnboardingState {
    initialisation: boolean;
    tour: TourKeys[];
}

const initialState: OnboardingState = {
    initialisation: false,
    tour: [],
};

export const onboardingSlice = createSlice({
    name: 'onboardingComplete',
    initialState,
    reducers: {
        complete(state, action: PayloadAction<keyof Omit<OnboardingState, 'tour'>>) {
            state[action.payload] = true;
        },
        completeTour(state, action: PayloadAction<TourKeys>) {
            state.tour.push(action.payload);
        },
    },
});

export default onboardingSlice.reducer;