import { createAsyncThunk } from '@reduxjs/toolkit';
import Providers from 'app/utilities/Providers';

export const fetchRequests = createAsyncThunk(
    'requests/fetch',
    () => Providers.getDataRequests()
)

export const refreshRequests = createAsyncThunk(
    'requests/refresh',
    async (arg, { dispatch }) => {
        await Providers.refresh();
        await dispatch(fetchRequests());
    }
)