import { BrowserWindow } from 'electron';
import { URL } from 'url';
import crypto from 'crypto';
import logger from './logger';

export interface SecureWindowParameters {
    key?: string;
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
function createSecureWindow(params: SecureWindowParameters): BrowserWindow {
    const { key, origin, options = {} } = params;

    // GUARD: webPreferences are off-limits
    if (Object.prototype.hasOwnProperty.call(options, 'webPreferences')) {
        throw new Error('InvalidBrowserWindowConfiguration');
    }

    const persistKey = key || crypto.randomBytes(64).toString('base64');

    // Initialise the window
    const window = new BrowserWindow({ 
        width: 400, 
        height: 600, 
        alwaysOnTop: true, 
        show: false, 
        webPreferences: {
            sandbox: true,
            contextIsolation: true,
            partition: `persist:${persistKey}`,
        },
        ...options,
    });

    // Disable menu bar in windows and linux
    window.setMenu(null);

    // Register the aeon:// protocol
    window.webContents.session.protocol.registerHttpProtocol('aeon', (request, callback) => {
        callback({ data: 'OK' }); 
    });

    // Deny any request for extra permissions in this handler
    window.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => callback(false));
    
    // Create a generic navigation handler so we can assign it to both will-navigate and will-redirect
    const navigationHandler = (event: Electron.Event, navigationUrl: string): void => {
        const parsedUrl = new URL(navigationUrl); 

        if (!parsedUrl.origin.endsWith(origin) && parsedUrl.protocol !== 'aeon:') {
            logger.provider.error(`A request for ${navigationUrl} was blocked because it did not match the predefined domain (${origin}, read ${parsedUrl.origin})`);
            event.preventDefault();
        }
    };

    // Restrict navigation to a particular origin
    window.webContents.on('will-navigate', navigationHandler);
    window.webContents.on('will-redirect', navigationHandler);

    // Log navigated URLs
    window.webContents.on('did-navigate', (event, url) => {
        logger.provider.info(`Secure window navigating to ${url}`);
    });

    // Open the devtools on development builds
    if (process.env.NODE_ENV !== 'production') {
        window.webContents.openDevTools();
    }
    
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
    params: SecureWindowParameters,
    fn: (window: BrowserWindow) => Promise<U>,
): Promise<U> {
    // Create new Window with the given parameters
    const window = createSecureWindow(params);

    // Create a Promise that inspects the window 'close' event, and rejects if
    // it is ever called.
    const closePromise = new Promise((resolve, reject) => {
        window.on('close', () => reject(new Error('SecureWindowUserAbort')));
    });

    // Create a timeout promise, in order to ensure we don't leavy any zombie
    // windows open in the background
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('SecureWindowTimeout')), 18_000_000);
    });

    // Race the function against the other promises, so that the whole function is
    // rejected if the window is ever closed or encounters the timeout.
    return (Promise.race([fn(window), closePromise, timeoutPromise]) as Promise<U>)
        .then((values): U => {
            // Also destroy the window when the function has been successfully completed.
            window.destroy();
            return values;
        });
}

export default createSecureWindow;