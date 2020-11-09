import { Storage } from 'redux-persist';

export default function ElectronStorage(): Storage {
    return {
        getItem: () => {
            return Promise.resolve(window.api.store.retrieve());
        },
        setItem: (key: string, item: string) => {
            return Promise.resolve(window.api.store.persist(item));
        },
        removeItem: () => {
            return Promise.resolve(window.api.store.clear());
        }
    };
}