import 'v8-compile-cache';
require('source-map-support').install();

import './lib/map-map';
import { app, BrowserWindow } from 'electron';
import path from 'path';
import initialise from './initialise';
import WindowStore from './lib/window-store';
import { unmountFS } from './lib/crypto-fs';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

app.allowRendererProcessReuse = true;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 800,
        width: 800,
        minWidth: 600,
        minHeight: 600,
        // titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: process.env.NODE_ENV === 'production',
        }
    });

    // Hide menu bar on windows
    if (process.env.NODE_ENV === 'production') {
        mainWindow.setMenu(null);
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
app.on('ready', async (): Promise<void> =>  { 
    await initialise();
    createWindow();
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

app.on('will-quit', () => {
    // Just before the application window is closed, we want to attempt to
    // unmount the encrypted filesystem, so we can start using it a bit more
    // quickly when the application starts again.
    unmountFS();
});
