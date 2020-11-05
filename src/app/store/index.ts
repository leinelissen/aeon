import { configureStore, MiddlewareArray } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { useDispatch } from 'react-redux';
import ElectronStorage from './persist';

import newCommits from './new-commits';
import onboarding from './onboarding';
import telemetry from './telemetry';
import { createMigrate, PersistConfig, persistReducer, persistStore } from 'redux-persist';
import migrations from './migrations';

// The root reducer contains all the individual reducers that make up the store
const rootReducer = combineReducers({
    newCommits,
    onboarding,
    telemetry
});

// Export types for later inclusion
export type State = ReturnType<typeof rootReducer>;

// Using this config, the store will be persisted using electron-store
const persistConfig: PersistConfig<State> = {
    key: 'app_store',
    storage: ElectronStorage(),
    version: 5,
    migrate: createMigrate(migrations),
    serialize: false,
    deserialize: false,
}

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);


// Create a store from the persisted root reducer, optionally applying middleware
const store = configureStore({
    reducer: persistedReducer,
    middleware: new MiddlewareArray().concat(

    ),
});

// Create a persisted store
export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;

// Export hooks with injected store types for ease-of-use
export const useAppDispatch = (): ReturnType<typeof useDispatch> => useDispatch<AppDispatch>();

// Export the store
export default store;