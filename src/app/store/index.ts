import { createConnectedStore, Store, Effects } from 'undux'
import persistStore, { retrievePersistedStore } from './persist';

type State = {
    // Whether onboarding has been completed
    onboardingComplete: {
        initialisation: boolean;
        log: boolean;
        newCommit: boolean;
    };
    // The revision number for the data structure of the store. This helps track
    // differing versions and helps adjust accordingly.
    storeRevision: number;
}

const initialState: State = {
    onboardingComplete: {
        initialisation: false,
        log: false,
        newCommit: false,
    },
    storeRevision: 2,
}

export type StoreProps = {
    store: Store<State>
}

export type StoreEffects = Effects<State>;

// Assign an explicit name to the component so that we can easily import it
// later through Intellisense
const Store = createConnectedStore(retrievePersistedStore(initialState), persistStore<State>());

export default Store;