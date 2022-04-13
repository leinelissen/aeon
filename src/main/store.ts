import ElectronStore from 'electron-store';
import { storePath } from './lib/constants';

const store = new ElectronStore({
    cwd: storePath,
    accessPropertiesByDotNotation: false,
});

export default store;