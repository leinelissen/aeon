import {
    contextBridge,
    ipcRenderer
} from 'electron';
// eslint-disable-next-line
import sourceMapSupport from 'source-map-support';
import store from 'main/store';
import type { State } from './store';

declare global {
    interface Window {
        api: {
            send: typeof ipcRenderer.send;
            invoke: typeof ipcRenderer.invoke;
            on: typeof ipcRenderer.on;
            removeListener: typeof ipcRenderer.removeListener;
            sourceMapSupport: typeof sourceMapSupport;
            store: {
                persist: (store: unknown) => void;
                retrieve: () => State;
                clear: () => void;
            }
        };
    }
}

const channelWhitelist = ['repository', 'providers', 'notifications', 'email' ];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
        // eslint-disable-next-line
        send: (channel: string, ...args: any[]) => {
            // whitelist channels
            if (channelWhitelist.includes(channel)) {
                ipcRenderer.send(channel, ...args);
            }
        },
        // eslint-disable-next-line
        invoke: (channel: string, ...args: any[]) => {
            // whitelist channels
            if (channelWhitelist.includes(channel)) {
                return ipcRenderer.invoke(channel, ...args);
            }
        },
        on: (channel: string, func: () => void) => {
            if (channelWhitelist.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                return ipcRenderer.on(channel, func);
            }
        },
        removeListener: (channel: string, func: () => void) => {
            if (channelWhitelist.includes(channel)) {
                return ipcRenderer.removeListener(channel, func);
            }
        },
        store: {
            persist: (state: State) => {
                return store.set('app_store', state);
            },
            retrieve: () => {
                return store.get('app_store');
            },
            clear: () => {
                return store.clear();
            }
        },
        sourceMapSupport: sourceMapSupport,
    },
);