import { app, autoUpdater, dialog } from 'electron';
import { autoUpdates } from './lib/constants';
import logger from './lib/logger';

// GUARD: Check if auto updates are not flagged to be disabled
// We use this particularly on macOS when testing so that we don't run into
// codesigning issues.
if (autoUpdates
    && process.env.NODE_ENV === 'production'
) {
    // Generate feed URL
    const server = 'https://updates.aeon.technology';
    const url = `${server}/update/${process.platform}${process.arch === 'arm64' ? '_arm64' : ''}/${app.getVersion()}`;

    // The application needs to be codesigned in order to accept updates. If the
    // application is not codesigned, it will crash when calling this function.
    // Since we have no way of knowing whether the application is codesigned,
    // we'll just swallow the error.
    try {
        autoUpdater.setFeedURL({ url });
    } catch (e) {
        logger.autoUpdater.error(e);
    }

    // Periodically check for updates. The default is every six hours.
    setInterval(() => {
        autoUpdater.checkForUpdates();
    }, 21600000);

    // If an update is downloaded, prompt the user to install it.
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.',
        };
    
        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall();
        });
    });

    logger.autoUpdater.info('Auto-updates enabled.');
} else {
    logger.autoUpdater.info('Auto-updates disabled.');
}