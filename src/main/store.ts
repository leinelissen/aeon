import ElectronStore from 'electron-store';

const store = new ElectronStore({
    accessPropertiesByDotNotation: false,
});

export default store;