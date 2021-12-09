import { app, autoUpdater, dialog } from "electron";

// GUARD: Check if auto updates are not flagged to be disabled
// We use this particularly on macOS when testing so that we don't run into
// codesigning issues.
if (!process.argv.includes('--no-auto-updates')
    && process.env.NODE_ENV === 'production'
) {
    // Generate feed URL
    const server = "https://updates.aeon.technology";
    const url = `${server}/update/${process.platform}/${app.getVersion()}`;
    autoUpdater.setFeedURL({ url })

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
            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
        };
    
        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        });
    });

}