import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import Repository from 'app/utilities/Repository';

export const fetchParsedCommit = createAsyncThunk(
    'data/fetch/parsed-commit',
    () => Repository.parsedCommit()
);

export const deleteDatum = createAction<number>(
    '/data/datum/delete',
)