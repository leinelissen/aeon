import 'v8-compile-cache';
// eslint-disable-next-line
require('source-map-support').install();

import './lib/map-map';
import './updates';
import { app, BrowserWindow } from 'electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import initialise from './initialise';
import WindowStore from './lib/window-store';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = (): void => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 800,
        width: 1000,
        minWidth: 600,
        minHeight: 600,
        titleBarStyle: 'hiddenInset',
        vibrancy: 'menu',
        transparent: true,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            webSecurity: process.env.NODE_ENV === 'production',
        },
    });
    
    // Hide menu bar on windows
    if (process.env.NODE_ENV === 'production') {
        mainWindow.setMenu(null);
    } else {
        // Install devtools when in development mode
        app.whenReady()
            .then(() => Promise.all([
                installExtension(REDUX_DEVTOOLS),
                installExtension(REACT_DEVELOPER_TOOLS),
            ]));
    }
    
    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    
    // save the window to a singleton so that we can access it later
    WindowStore.getInstance().window = mainWindow;
    
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', (): void =>  { 
    createWindow();
    initialise();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Windows can only handle single instance when processing deep links. Hence, we
// only allow a single instance to be open at any time.
const gotTheLock = app.requestSingleInstanceLock();

// GUARD: Check if we're the only instance of the app running
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}