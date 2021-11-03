import 'v8-compile-cache';
// eslint-disable-next-line
require('source-map-support').install();

import './lib/map-map';
import { app, autoUpdater, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import initialise from './initialise';
import WindowStore from './lib/window-store';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

app.allowRendererProcessReuse = true;

// GUARD: Check if auto updates are not flagged to be disabled
// We use this particularly on macOS when testing so that we don't run into
// codesigning issues.
if (!process.argv.includes('--no-auto-updates')) {
    const server = "https://updates.aeon.technology";
    const url = `${server}/update/${process.platform}/${app.getVersion()}`;
    autoUpdater.setFeedURL({ url })
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 800,
        width: 1000,
        minWidth: 600,
        minHeight: 600,
        titleBarStyle: 'hiddenInset',
        vibrancy: 'medium-light',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: process.env.NODE_ENV === 'production',
        }
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
