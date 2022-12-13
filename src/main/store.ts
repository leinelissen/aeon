import ElectronStore from 'electron-store';
import Keytar from 'keytar';
import { storePath } from './lib/constants';

const store = new ElectronStore({
    cwd: storePath,
    accessPropertiesByDotNotation: false,
});

export class KeyStore {
    static serviceName = 'nl.leinelissen.aeon';

    static get(account: string) {
        return Keytar.getPassword(KeyStore.serviceName, account);
    }

    static set(account: string, password: string) {
        return Keytar.setPassword(KeyStore.serviceName, account, password);
    }

    static delete(account: string) {
        return Keytar.deletePassword(KeyStore.serviceName, account);
    }
}


export default store;