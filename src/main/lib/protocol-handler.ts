import { app } from 'electron/main';
import path from 'path';

/** The registered callback  */
type ProtocolCallback = (url: string) => void;

/**
* This stores Promise functions for protocols that expect to await a protocol response
*/
const registeredDeferreds: Map<string, [(value: string) => void, (reason: string) => void]> = new Map();

/**
* This stores permanent callbacks for protocol responses
*/
const registeredCallbacks: Map<string, ProtocolCallback> = new Map();

/**
* This function will return a promise that resolves once a protocol call is
* received that matches the URL partial. This only works with the aeon://
* protocol. The returned string in the promise is the protocol URL.
* NOTE: when a Promise already exists for the exact urlPath, it will be rejected.
*/
export function getProtocolResultForPath(urlPath: string) {
    // GUARD: Check if the urlPath is already registered
    if (registeredDeferreds.has(urlPath)) {
        // If so, we reject the promise
        const [, reject] = registeredDeferreds.get(urlPath);
        reject('A new protocol callback was registered for' + urlPath);
    }
    
    // Create a new promise
    return new Promise<string>((resolve, reject) => {
        // Register the resolve and reject functions as deferreds
        registeredDeferreds.set(urlPath, [resolve, reject]);
    });
}

/**
* This will register a handler for whenever a protocol is called that matches a
* particular URL partial path. The callback will resolve with the full URL. 
* Only a single callback can be registered for an unique partial path. 
*/
export function registerProtocolCallbackForPath(urlPath: string, callback: ProtocolCallback) {
    registeredCallbacks.set(urlPath, callback);
}

/**
* This is an internal function to register all the protocol handlers.
*/
export function setupProtocolHandlers() {
    // Register the protocol with the OS
    if (process.defaultApp) {
        if (process.argv.length >= 2) {
            app.setAsDefaultProtocolClient(
                'aeon',
                process.execPath,
                [path.resolve(process.argv[1])],
            );
        }
    } else {
        app.setAsDefaultProtocolClient('aeon');
    }
        
    // Register the global protocol handler
    app.on('open-url', function (event, url) {
        // Prevent the event from bubbling up the tree
        event.preventDefault();
        
        // Get the urlPath by parsing the incoming URL.
        // NOTE: The urlPath does not contain query parameters, but the url that
        // is returned to the callbacks does.
        const { origin, pathname } = new URL(url);
        const urlPath = origin + pathname;
        
        // GUARD: If a promise is registered for this path, execute it and then
        // remove it from the map.
        if (registeredDeferreds.has(urlPath)) {
            const [resolve] = registeredDeferreds.get(urlPath);
            resolve(url);
            registeredDeferreds.delete(urlPath);
        }
        
        // GUARD: If a callback is registered for this path, execute it.
        if (registeredCallbacks.has(urlPath)) {
            const callback = registeredCallbacks.get(urlPath);
            callback(url);
        }
    });
}
    