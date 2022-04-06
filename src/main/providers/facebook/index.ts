import { app } from 'electron';
import { withSecureWindow } from 'main/lib/create-secure-window';
import { ProviderFile } from '../types';
import { DataRequestProvider } from '../types/Provider';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

const requestSavePath = path.join(app.getAppPath(), 'data');

class Facebook extends DataRequestProvider {
    public static key = 'facebook';

    public static dataRequestIntervalDays = 5;

    public static requiresEmailAccount = false;

    /**
     * The parameters to be stored for the secure windows
     */
    windowParams = {
        key: this.windowKey,
        origin: 'facebook.com',
    };

    async initialise(): Promise<string> {
        await this.verifyLoggedInStatus();
        return this.getAccountName();
    }

    /**
     * Get the account name for the logged-in Facebook account
     */
    getAccountName = async (): Promise<string> => {
        return withSecureWindow<string>(this.windowParams, async (window) => {
            await window.loadURL('https://www.facebook.com/settings?tab=account&view');

            // Wait for two seconds for React to mount its components and load
            // some friggin iframes
            // TODO: Wait for Facebook to implement sound engineering practices
            await new Promise((resolve) => setTimeout(resolve, 2000));

            return window.webContents.executeJavaScript(`
                document.body.querySelector('a[href="/settings?tab=account&section=email"]');
            `); 
        });
    };

    verifyLoggedInStatus = async (): Promise<Electron.Cookie[]> => {
        return withSecureWindow<Electron.Cookie[]>(this.windowParams, (window) => {
            const settingsUrl = 'https://www.facebook.com/settings';
            window.loadURL('https://www.facebook.com/login.php?next=https%3A%2F%2Fwww.facebook.com%2Fsettings');

            return new Promise((resolve) => {
                const eventHandler = async (): Promise<void> => {
                    // Check if we ended up at the page in an authenticated form
                    if (window.webContents.getURL().startsWith(settingsUrl)) {
                        // If so, we retrieve the cookies
                        const cookies = await window.webContents.session.cookies.get({});
                        
                        resolve(cookies);
                    } else if (!window.isVisible()) {
                        // If not, we'll check if we need to open the window for the
                        // user to enter their credentials.
                        window.show();
                    }
                };

                window.webContents.on('did-navigate', eventHandler);
                window.webContents.once('did-finish-load', eventHandler);
            });
        });
    };

    update = async (): Promise<false> => {
        // NOTE: Updating is not supported by Facebook since it's internal API
        // is a enormous clusterfuck and cannot be trusted.
        return false;
    };

    dispatchDataRequest = async (): Promise<void> => {
        await this.verifyLoggedInStatus();

        return withSecureWindow<void>(this.windowParams, async (window) => {
            window.show();

            await new Promise((resolve) => {
                window.webContents.on('did-finish-load', resolve);
                window.loadURL('https://www.facebook.com/dyi/?referrer=yfi_settings&tab=new_archive');
            });

            // Wait for all the iframes to load
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Now we must defer the page to the user, so that they can enter their
            // password. We then listen for a succesfull AJAX call 
            return new Promise((resolve) => {
                window.webContents.session.webRequest.onBeforeRequest({
                    urls: [ 'https://www.facebook.com/api/graphql/' ],
                }, (details, callback) => {
                    // Parse the upload object that is passed to the GraphQL API
                    const data = details.uploadData[0]?.bytes?.toString('utf8');

                    // GUARD: If there is not data, we're parsing the wrong requests
                    if (!data) {
                        callback({});
                        return;
                    }

                    // Then parse the params that are sent to the GraphQL API
                    const params = new URLSearchParams(data);

                    // Check if we're capturing the right call
                    if (params && params.get('fb_api_req_friendly_name') === 'DYISubmitRequestMutation') {
                        // If so, setup a listener to check if the request is
                        // completed correctly.
                        resolve();
                    }

                    callback({});
                });

                // Ensure that the data request is in JSON format
                window.webContents.executeJavaScript(`
                    (async function() {
                        document.body.querySelector('label[aria-label=Format]').click();
                        await new Promise((resolve) => setTimeout(resolve, 50));
                        Array.from(document.querySelectorAll('[role=menuitemradio]'))
                            .find((el) => el.textContent === 'JSON')?.click();
                        await new Promise((resolve) => setTimeout(resolve, 50));
                        document.body.querySelector('label[aria-label="Date range (required)"]').click();
                        await new Promise((resolve) => setTimeout(resolve, 50));
                        Array.from(document.querySelectorAll('[role=menuitemradio]'))
                            .find((el) => el.textContent === 'All time')?.click();
                        await new Promise((resolve) => setTimeout(resolve, 50));
                        document.body.querySelector('[aria-label="Request a download"]').click();
                    })()
                `);
            });     
        });
    };

    async isDataRequestComplete(): Promise<boolean> {
        await this.verifyLoggedInStatus();

        return withSecureWindow<boolean>(this.windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve);
                window.loadURL('https://www.facebook.com/dyi/?referrer=yfi_settings&tab=all_archives');
            });

            // Find a download button and make sure no *Pending* spans exist
            return window.webContents.executeJavaScript(`
                document.querySelector('div[aria-label="Download"]')
                    && !Array.from(document.querySelectorAll('span')).map((el) => el.textContent).includes('Pending');
            `);
        });
    }

    async parseDataRequest(extractionPath: string): Promise<ProviderFile[]> {
        return withSecureWindow<ProviderFile[]>(this.windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('dom-ready', resolve);
                window.loadURL('https://www.facebook.com/dyi/?referrer=yfi_settings&tab=all_archives');
            });

            const filePath = path.join(requestSavePath, 'facebook.zip');
            await new Promise((resolve) => {
                // Create a handler for any file saving actions
                window.webContents.session.once('will-download', (event, item) => {
                    // Save the item to the data folder temporarily
                    item.setSavePath(filePath);
                    item.once('done', resolve);
                });

                // And then trigger the button click
                window.webContents.executeJavaScript(`
                    document.querySelector('div[aria-label="Download"]').click();
                `);

                window.show();
            });

            // We have the ZIP, all that's left to do is unpack it and pipe it to
            // the repository
            const zip = new AdmZip(filePath);
            await new Promise((resolve) => 
                // Fix underway: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/59070
                zip.extractAllToAsync(extractionPath, true, false, resolve),
            );

            // Translate this into a form that is readable for the ParserManager
            const files = zip.getEntries().map((entry): ProviderFile => {
                return {
                    filepath: entry.entryName,
                    data: null,
                    // data: entry.getData(),
                };
            });

            // And dont forget to remove the zip file after it's been processed
            await fs.promises.unlink(filePath);

            return files;
        });
    }
}

export default Facebook;