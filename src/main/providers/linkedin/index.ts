import { app } from 'electron';
import { withSecureWindow } from 'main/lib/create-secure-window';
import { ProviderFile } from '../types';
import { DataRequestProvider } from '../types/Provider';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

const requestSavePath = path.join(app.getAppPath(), 'data');

class LinkedIn extends DataRequestProvider {
    public static key = 'linkedin';

    public static dataRequestIntervalDays = 14;

    public static requiresEmailAccount = false;

    /**
     * The parameters to be stored for the secure windows
     */
    windowParams = {
        key: this.windowKey,
        origin: 'linkedin.com',
    };

    async initialise(): Promise<string> {
        await this.verifyLoggedInStatus();
        return this.getAccountName();
    }

    getAccountName = async (): Promise<string> => {
        return withSecureWindow<string>(this.windowParams, async (window) => {
            // Go to /me and wait for LinkedIn to redirect
            await window.loadURL('https://www.linkedin.com/psettings/email');

            // Then steal the accountname from the URL
            return window.webContents.executeJavaScript(`
                document.querySelector('.email-container p.email-address').textContent
            `);
        });
    };

    verifyLoggedInStatus = async (): Promise<Electron.Cookie[]> => {
        return withSecureWindow<Electron.Cookie[]>(this.windowParams, (window) => {
            const settingsUrl = 'https://www.linkedin.com/psettings/member-data';
            window.loadURL(settingsUrl);

            return new Promise((resolve) => {
                const eventHandler = async (): Promise<void> => {
                    // Check if we ended up at the page in an authenticated form
                    if (settingsUrl === window.webContents.getURL()) {
                        // If so, we retrieve the cookies
                        const cookies = await window.webContents.session.cookies.get({});
                        
                        // Do a check if the language is set to English, and if not,
                        // change it to English
                        const lang = cookies.find((cookie) => cookie.name === 'lang');
                        if (lang?.value !== 'v=2&lang=en-us') {
                            await window.webContents.session.cookies.set({ 
                                url: 'https://linkedin.com',
                                name: 'lang',
                                value: 'v=2&lang=en-us',
                                domain: '.linkedin.com',
                                secure: true,
                                expirationDate: Math.pow(2, 31) - 1,
                            });
                        }

                        resolve(cookies);
                    } else if (!window.isVisible()) {
                        // If not, we'll check if we need to open the window for the
                        // user to enter their credentials.
                        window.show();
                    }

                    // LinkedIn redirects users to the signup page rather than
                    // the login screen because of magic sauce, I guess. This
                    // means we need to load the right page automatically.
                    window.webContents.executeJavaScript(`
                        document.querySelector('a.main__sign-in-link')?.click();
                    `);
                };

                window.webContents.on('did-navigate', eventHandler);
                window.webContents.once('did-finish-load', eventHandler);
            });
        });
    };

    update = async (): Promise<false> => {
        // NOTE: LinkedIn has not accessible Privacy APIs at this point.
        return false;
    };

    dispatchDataRequest = async (): Promise<void> => {
        await this.verifyLoggedInStatus();

        return withSecureWindow<void>(this.windowParams, async (window) => {
            window.hide();

            await new Promise((resolve) => {
                window.webContents.on('did-finish-load', resolve);
                window.loadURL('https://www.linkedin.com/psettings/member-data');
            });

            // Now we must defer the page to the user, so that they can enter their
            // password. We then listen for a succesfull AJAX call 
            return new Promise((resolve) => {
                window.webContents.session.webRequest.onCompleted({
                    urls: [ 'https://*.linkedin.com/*' ],
                }, (details: Electron.OnCompletedListenerDetails) => {
                    if (details.url === 'https://www.linkedin.com/psettings/member-data/export'
                        && details.statusCode === 200) {
                        resolve();
                    }
                });

                // Select the full archive
                window.webContents.executeJavaScript(`
                    document.querySelector('input#fast-file-only-plus-other-data')?.click();
                `);

                // Then request the archive
                window.webContents.executeJavaScript(`
                    document.querySelector('button#download-button')?.click();
                `);

                window.show();
            });
        });
    };

    async isDataRequestComplete(): Promise<boolean> {
        await this.verifyLoggedInStatus();

        return withSecureWindow<boolean>(this.windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve);
                window.loadURL('https://www.linkedin.com/psettings/member-data');
            });

            // Find the right button and check if it reads 'Download archive'
            // Also, LinkedIn only allows for a single download every 24hrs,
            // after which you'll need to wait. We account for this by checking
            // if the button is disabled
            return window.webContents.executeJavaScript(`
                var btn = document.querySelector('button.download-btn');
                btn.textContent === 'Download archive'
                    && !btn.disabled
            `);
        });
    }

    async parseDataRequest(extractionPath: string): Promise<ProviderFile[]> {
        return withSecureWindow<ProviderFile[]>(this.windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve);
                window.loadURL('https://www.linkedin.com/psettings/member-data');
            });

            const filePath = path.join(requestSavePath, 'linkedin.zip');
            await new Promise((resolve) => {
                // Create a handler for any file saving actions
                window.webContents.session.once('will-download', (event, item) => {
                    // Save the item to the data folder temporarily
                    item.setSavePath(filePath);
                    item.once('done', resolve);
                });

                // And then trigger the button click
                window.webContents.executeJavaScript(`
                    document.querySelector('button.download-btn')?.click();
                `);
            });

            // Close window
            window.hide();

            // Firstly, we'll save all files in a JSON format
            const zip = new AdmZip(filePath);
            await new Promise((resolve) => 
                zip.extractAllToAsync(extractionPath, true, resolve),
            );

            // Then, we'll structure the returned data
            const files = zip.getEntries().map((entry): ProviderFile => {
                return {
                    filepath: entry.entryName,
                    data: null,
                };
            });

            // And dont forget to remove the zip file after it's been processed
            await fs.promises.unlink(filePath);

            return files;
        });
    }
}

export default LinkedIn;