import { StoreDefinition, Effects } from 'undux';
import { State } from '.';

/**
 * Persists and updates to the store via ElectronStore and reads persisted data
 * upon application launch. This actual saving is done on the back-end as the
 * renderer process cannot access the filesystem
 */

function persistStore(): Effects<State> {
    const withStore: Effects<State> = (store): StoreDefinition<State> => {
        store.onAll().subscribe(() => {
            window.api.store.persist(store.getState());
        });

        return store;
    }

    return withStore;
}

/**
 * Reads the persisted data from the store
 */
export function retrievePersistedStore(initialState: State): State {
    return window.api.store.retrieve() || initialState;
}

export default persistStore;