import {
    contextBridge,
    ipcRenderer
} from 'electron';
import sourceMapSupport from 'source-map-support';
import { WORKDIR, STAGE, TREE } from 'isomorphic-git';

declare global {
    interface Window {
      api: {
          send: typeof ipcRenderer.send;
          invoke: typeof ipcRenderer.invoke;
          on: typeof ipcRenderer.on;
          sourceMapSupport: typeof sourceMapSupport;
          git: {
              WORKDIR: typeof WORKDIR;
              STAGE: typeof STAGE;
              TREE: typeof TREE;
          };
      };
    }
}

const channelWhitelist = ['repository', 'providers' ];

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
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        sourceMapSupport: sourceMapSupport,
        git: {
            TREE: TREE,
            WORKDIR: WORKDIR,
            STAGE: STAGE,
        }
    },
);