import { app } from 'electron';
import { withSecureWindow } from 'main/lib/create-secure-window';
import { DataRequestProvider, ProviderFile } from '../types';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

const windowParams = {
    key: 'linkedin',
    origin: 'linkedin.com',
};

const requestSavePath = path.join(app.getAppPath(), 'data');

class LinkedIn extends DataRequestProvider {
    public static key = 'linkedin';
    public static dataRequestIntervalDays = 14;

    async initialise(): Promise<boolean> {
        await this.verifyLoggedInStatus();

        return true;
    }

    verifyLoggedInStatus = async (): Promise<Electron.Cookie[]> => {
        return withSecureWindow<Electron.Cookie[]>(windowParams, (window) => {
            const settingsUrl = 'https://www.linkedin.com/psettings/member-data';
            window.loadURL(settingsUrl);

            return new Promise((resolve) => {
                const eventHandler = async(): Promise<void> => {
                    // Check if we ended up at the page in an authenticated form
                    if (settingsUrl === window.webContents.getURL()) {
                        // If so, we retrieve the cookies
                        const cookies = await window.webContents.session.cookies.get({});
                        
                        // Do a check if the language is set to English, and if not,
                        // change it to English
                        const lang = cookies.find(cookie => cookie.name === 'lang');
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
    }

    update = async (): Promise<false> => {
        // NOTE: LinkedIn has not accessible Privacy APIs at this point.
        return false;
    }

    dispatchDataRequest = async (): Promise<void> => {
        await this.verifyLoggedInStatus();

        return withSecureWindow<void>(windowParams, async (window) => {
            window.hide();

            await new Promise((resolve) => {
                window.webContents.on('did-finish-load', resolve)
                window.loadURL('https://www.linkedin.com/psettings/member-data');
            });

            // Now we must defer the page to the user, so that they can enter their
            // password. We then listen for a succesfull AJAX call 
            return new Promise((resolve) => {
                window.webContents.session.webRequest.onCompleted({
                    urls: [ 'https://*.linkedin.com/*' ]
                }, (details: Electron.OnCompletedListenerDetails) => {
                    console.log('NEW REQUEST', details);

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
    }

    async isDataRequestComplete(): Promise<boolean> {
        await this.verifyLoggedInStatus();

        return withSecureWindow<boolean>(windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve)
                window.loadURL('https://www.linkedin.com/psettings/member-data');
            });

            // Find a div that reads 'A copy of your information is
            // being created'
            return window.webContents.executeJavaScript(`
                document.querySelector('button.download-btn').textContent === 'Download archive'
            `);
        });
    }

    async parseDataRequest(): Promise<ProviderFile[]> {
        throw new Error('NotImplementedYet');
        return [];
    }
}

export default LinkedIn;