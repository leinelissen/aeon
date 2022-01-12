import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Event {
    event: string;
    element: string;
    timestamp: string;
    route: string;
}

const initialState: Event[] = [];

export const telemetrySlice = createSlice({
    name: 'telemetry',
    initialState,
    reducers: {
        log(state, action: PayloadAction<Event>) {
            state.push(action.payload);
        },
    },
});

export default telemetrySlice.reducer;