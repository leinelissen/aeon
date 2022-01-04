import {
    contextBridge,
    ipcRenderer,
    shell
} from 'electron';
import ElectronStore from 'electron-store';
import type { CommandLineArguments } from 'main/lib/constants';
// eslint-disable-next-line
import sourceMapSupport from 'source-map-support';
import type { State } from './store';

const store = new ElectronStore();

interface WindowApi {
    send: typeof ipcRenderer.send;
    invoke: typeof ipcRenderer.invoke;
    on: typeof ipcRenderer.on;
    removeListener: typeof ipcRenderer.removeListener;
    sourceMapSupport: typeof sourceMapSupport;
    store: {
        persist: (store: unknown) => void;
        retrieve: () => State;
        clear: () => void;
    },
    openEmailClient: (email: string, subject: string, body: string) => Promise<void>;
    env: CommandLineArguments;
}

declare global {
    interface Window {
        api: WindowApi
    }
}

const channelWhitelist = ['repository', 'providers', 'notifications', 'email' ];

const windowApi: WindowApi = {
    send: (channel, ...args) => {
        // whitelist channels
        if (channelWhitelist.includes(channel)) {
            ipcRenderer.send(channel, ...args);
        }
    },
    invoke: (channel, ...args) => {
        if (channelWhitelist.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args);
        }
    },
    on: (channel, listener) => {
        if (channelWhitelist.includes(channel)) {
            return ipcRenderer.on(channel, listener);
        }
    },
    removeListener: (channel, listener) => {
        if (channelWhitelist.includes(channel)) {
            return ipcRenderer.removeListener(channel, listener);
        }
    },
    store: {
        persist: (state: State) => {
            return store.set('app_store', state);
        },
        retrieve: () => {
            return store.get('app_store') as State;
        },
        clear: () => {
            return store.clear();
        }
    },
    sourceMapSupport: sourceMapSupport,
    openEmailClient: (email, subject, body) => shell.openExternal(
        `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    ),
    env: ipcRenderer.sendSync('env') as CommandLineArguments,
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', windowApi);