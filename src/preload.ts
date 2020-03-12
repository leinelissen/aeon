import {
    contextBridge,
    ipcRenderer
} from "electron";
import sourceMapSupport from 'source-map-support';

declare global {
    interface Window {
      api: {
          send: typeof ipcRenderer.send;
          invoke: typeof ipcRenderer.invoke;
          on: typeof ipcRenderer.on;
          sourceMapSupport: typeof sourceMapSupport;
      };
    }
}

const channelWhitelist = ["repository"]

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel: any, data: any) => {
            // whitelist channels
            if (channelWhitelist.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        invoke: (channel: any, data: any) => {
            // whitelist channels
            if (channelWhitelist.includes(channel)) {
                return ipcRenderer.invoke(channel, data);
            }
        },
        on: (channel: any, func: any) => {
            if (channelWhitelist.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        sourceMapSupport: sourceMapSupport,
    },
);