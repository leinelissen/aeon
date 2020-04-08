import { createConnectedStore, Store, Effects } from 'undux'
import persistStore, { retrievePersistedStore } from './persist';

type State = {
    // Whether onboarding has been completed
    isOnboarded: boolean;
}

const initialState: State = {
    isOnboarded: false,
}

export type StoreProps = {
    store: Store<State>
}

export type StoreEffects = Effects<State>;

// Assign an explicit name to the component so that we can easily import it
// later through Intellisense
const Store = createConnectedStore(retrievePersistedStore(initialState), persistStore<State>());

export default Store;