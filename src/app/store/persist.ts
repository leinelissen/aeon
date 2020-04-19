import { StoreDefinition, Store, Effects } from 'undux';

/**
 * Persists and updates to the store via ElectronStore and reads persisted data
 * upon application launch. This actual saving is done on the back-end as the
 * renderer process cannot access the filesystem
 */

function persistStore<State extends Object>() {
    const withStore: Effects<State> = (store): StoreDefinition<State> => {
        store.onAll().subscribe(() => {
            console.log('PERSISTING STORE', store.getState());
            window.api.store.persist(store.getState());
        });

        return store;
    }

    return withStore;
}

/**
 * Reads the persisted data from the store
 */
export function retrievePersistedStore<State>(initialState: State): State {
    return (window.api.store.retrieve() as State) || initialState;
}

export default persistStore;