import {
    contextBridge,
    ipcRenderer
} from 'electron';
import sourceMapSupport from 'source-map-support';
import { WORKDIR, STAGE, TREE } from 'isomorphic-git';
import store from 'main/store';

declare global {
    interface Window {
        api: {
            send: typeof ipcRenderer.send;
            invoke: typeof ipcRenderer.invoke;
            on: typeof ipcRenderer.on;
            removeListener: typeof ipcRenderer.removeListener;
            sourceMapSupport: typeof sourceMapSupport;
            git: {
                WORKDIR: typeof WORKDIR;
                STAGE: typeof STAGE;
                TREE: typeof TREE;
            };
            store: {
                persist: (store: Object) => void;
                retrieve: () => Object;
                clear: () => void;
            }
        };
    }
}

const channelWhitelist = ['repository', 'providers', 'notifications' ];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'api', {
        send: (channel: string, ...args: any[]) => {
            // whitelist channels
            if (channelWhitelist.includes(channel)) {
                ipcRenderer.send(channel, ...args);
            }
        },
        invoke: (channel: string, ...args: any[]) => {
            // whitelist channels
            if (channelWhitelist.includes(channel)) {
                return ipcRenderer.invoke(channel, ...args);
            }
        },
        on: (channel: string, func: any) => {
            if (channelWhitelist.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                return ipcRenderer.on(channel, func);
            }
        },
        removeListener: (channel: string, func: any) => {
            if (channelWhitelist.includes(channel)) {
                return ipcRenderer.removeListener(channel, func);
            }
        },
        store: {
            persist: (state: Object) => {
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
        git: {
            TREE: TREE,
            WORKDIR: WORKDIR,
            STAGE: STAGE,
        },
    },
);

if (process.env.IS_TEST === 'true') {
    window.electronRequire = require
}