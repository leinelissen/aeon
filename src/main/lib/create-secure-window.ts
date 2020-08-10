import { BrowserWindow } from 'electron';
import { URL } from 'url';

interface Params {
    key: string;
    origin: string;
    options?: Electron.BrowserWindowConstructorOptions;
}

/**
 * This function will create a secure BrowserWindow that implements Electron
 * best practices for loading remote content. See https://www.electronjs.org/docs/tutorial/security
 * @param origin The origin to which the BrowserWindow should be limited. If the
 * page navigates to another origin, the request is denied
 * @param options An optional options object that should be passed to the
 * BrowserWindow constructor. This may not contain webPreferences
 */
function createSecureWindow(params: Params) {
    const { key, origin, options = {} } = params;

    // GUARD: webPreferences are off-limits
    if (Object.prototype.hasOwnProperty.call(options, 'webPreferences')) {
        throw new Error('InvalidBrowserWindowConfiguration');
    }

    // Initialise the window
    const window = new BrowserWindow({ 
        width: 400, 
        height: 600, 
        alwaysOnTop: true, 
        show: false, 
        webPreferences: {
            nodeIntegration: process.env.IS_TEST === 'true',
            // enableRemoteModule: false,
            sandbox: true,
            contextIsolation: true,
            partition: `persist:${key}`,
        },
        ...options,
    });

    // Disable menu bar in windows and linux
    window.setMenu(null);

    // Deny any request for extra permissions in this handler
    window.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => callback(false));
    
    // Restrict navigation to a particular origin
    window.webContents.on('will-navigate', (event, navigationUrl: string): void => {
        const parsedUrl = new URL(navigationUrl); 

        if (!parsedUrl.origin.endsWith(origin)) {
            console.error(`[BROWSER-WINDOW] A request for ${navigationUrl} was blocked because it did not match the predefined domain (${origin}, read ${parsedUrl.origin})`);
            event.preventDefault();
        }
    });
    
    return window;
} 

/**
 * This is a HOC wrapper function that transparently makes available a window
 * function, while accepting a return Promise. It adds another check to see if
 * the Window is closed by the user, so that the aborted function can be
 * transparently passed back to the caller.
 * @param fn The function that needs the window object
 */
export function withSecureWindow<U>(
        params: Params,
        fn: (window: BrowserWindow) => Promise<U>,
    ): Promise<U> {
    // Create new Window with the given parameters
    const window = createSecureWindow(params);

    // Create a Promise that inspects the window 'close' event, and rejects if
    // it is ever called.
    const closePromise = new Promise((resolve, reject) => {
        window.on('close', () => reject(new Error('UserAbort')));
    });

    // Race the function against the closePromise, so that the whole function is
    // reject if the window is ever closed.
    return (Promise.race([fn(window), closePromise]) as Promise<U>)
        .then((values): U => {
            // Also destroy the window when the function has been successfully completed.
            window.destroy();
            return values;
        });
}

export default createSecureWindow;