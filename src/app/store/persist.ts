import { Storage } from 'redux-persist';

export default function ElectronStorage(): Storage {
    return {
        getItem: (...props) => {
            console.log('GETITEM', props, window.api.store.retrieve());
            return Promise.resolve(window.api.store.retrieve());
        },
        setItem: (key: string, item: string) => {
            console.log('SETITEM', key, item);
            return Promise.resolve(window.api.store.persist(item));
        },
        removeItem: () => {
            return Promise.resolve(window.api.store.clear());
        }
    };
}