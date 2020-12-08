import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { 
    createMigrate, 
    PersistConfig, 
    persistReducer, 
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist';
import { useDispatch } from 'react-redux';
import ElectronStorage from './persist';
import migrations from './migrations';

import newCommits from './new-commits';
import onboarding from './onboarding';
import telemetry from './telemetry';
import accounts from './accounts';
import email from './email';
import data from './data';

// The root reducer contains all the individual reducers that make up the store
const rootReducer = combineReducers({
    newCommits,
    onboarding,
    telemetry,
    accounts,
    email,
    data
});

// Export types for later inclusion
export type State = ReturnType<typeof rootReducer>;

// Using this config, the store will be persisted using electron-store
const persistConfig: PersistConfig<State> = {
    key: 'app_store',
    storage: ElectronStorage(),
    version: 8,
    migrate: createMigrate(migrations),
    serialize: false,
    deserialize: false,
    blacklist: ['data']
}

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);


// Create a store from the persisted root reducer, optionally applying middleware
const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware({
        // We need to ignore all redux-persist actions
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
    })
});

// Create a persisted store
export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;

// Export hooks with injected store types for ease-of-use
export const useAppDispatch = (): typeof store.dispatch => useDispatch<AppDispatch>();

// Export the store
export default store;