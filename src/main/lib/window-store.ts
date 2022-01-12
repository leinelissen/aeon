import { BrowserWindow } from 'electron';

class WindowStore {
    private static instance: WindowStore;

    private _window: BrowserWindow;

    static getInstance(): WindowStore {
        if (!WindowStore.instance) {
            WindowStore.instance = new WindowStore();
        }

        return WindowStore.instance;
    }

    static getWindow(): BrowserWindow {
        return this.getInstance().window;
    }

    set window(window: BrowserWindow) {
        this._window = window;
    }

    get window(): BrowserWindow {
        return this._window;
    }
}

export default WindowStore;