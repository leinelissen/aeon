import { BrowserWindow } from 'electron';
import { URL } from 'url';

/**
 * This function will create a secure BrowserWindow that implements Electron
 * best practices for loading remote content. See https://www.electronjs.org/docs/tutorial/security
 * @param origin The origin to which the BrowserWindow should be limited. If the
 * page navigates to another origin, the request is denied
 * @param options An optional options object that should be passed to the
 * BrowserWindow constructor. This may not contain webPreferences
 */
function createSecureWindow(origin: string, options: Electron.BrowserWindowConstructorOptions = {}) {
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
            enableRemoteModule: false,
            sandbox: true,
            contextIsolation: true,
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

export default createSecureWindow;