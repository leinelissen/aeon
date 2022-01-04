import ElectronStore from 'electron-store';
import { storePath } from './lib/constants';

const store = new ElectronStore({
    cwd: storePath,
});

export default store;