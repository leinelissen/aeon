import { app } from 'electron';
import { withSecureWindow } from 'main/lib/create-secure-window';
import { DataRequestProvider, ProviderFile } from '../types';
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
        origin: 'facebook.com'
    };

    async initialise(): Promise<string> {
        await this.verifyLoggedInStatus();
        return this.getAccountName();
    }

    /**
     * Get the account name for the logged-in Facebook account
     */
    getAccountName = async(): Promise<string> => {
        return withSecureWindow<string>(this.windowParams, async (window) => {
            await window.loadURL('https://www.facebook.com/settings?tab=account&view');

            // Wait for two seconds for React to mount its components and load
            // some friggin iframes
            // TODO: Wait for Facebook to implement sound engineering practices
            await new Promise((resolve) => setTimeout(resolve, 2000));

            return window.webContents.executeJavaScript(`
                Array.from(document.querySelectorAll('iframe')).reduce((sum, iframe) => {
                    return sum || iframe.contentWindow.document.body.querySelector('a[href="/settings?tab=account&section=email"]')
                }, null)?.querySelector('strong')?.textContent;
            `); 
        });
    }

    verifyLoggedInStatus = async (): Promise<Electron.Cookie[]> => {
        return withSecureWindow<Electron.Cookie[]>(this.windowParams, (window) => {
            const settingsUrl = 'https://www.facebook.com/settings';
            window.loadURL('https://www.facebook.com/login.php?next=https%3A%2F%2Fwww.facebook.com%2Fsettings');

            return new Promise((resolve) => {
                const eventHandler = async(): Promise<void> => {
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
    }

    update = async (): Promise<false> => {
        // NOTE: Updating is not supported by Facebook since it's internal API
        // is a enormous clusterfuck and cannot be trusted.
        return false;
    }

    dispatchDataRequest = async (): Promise<void> => {
        await this.verifyLoggedInStatus();

        return withSecureWindow<void>(this.windowParams, async (window) => {
            window.hide();

            await new Promise((resolve) => {
                window.webContents.on('did-finish-load', resolve)
                window.loadURL('https://www.facebook.com/dyi/?referrer=yfi_settings&tab=new_archive');
            });

            // Wait for all the iframes to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Now we must defer the page to the user, so that they can enter their
            // password. We then listen for a succesfull AJAX call 
            return new Promise((resolve) => {
                window.webContents.session.webRequest.onBeforeRequest({
                    urls: [ 'https://www.facebook.com/api/graphql/' ]
                }, (details: Electron.OnBeforeRequestListenerDetails) => {
                    // Parse the upload object that is passed to the GraphQL API
                    const data = details.uploadData[0]?.bytes?.toString('utf8');

                    // GUARD: If there is not data, we're parsing the wrong requests
                    if (!data) {
                        return;
                    }

                    // Then parse the params that are sent to the GraphQL API
                    const params = new URLSearchParams(data);
                    console.log(Array.from(params.keys()));

                    // Check if we're capturing the right call
                    if (params && params.get('fb_api_req_friendly_name') === 'DYISectionsCreateJobMutation') {
                        // If so, setup a listener to check if the request is
                        // completed correctly.
                        resolve();
                    }
                });

                // Ensure that the data request is in JSON format
                window.webContents.executeJavaScript(`
                    Array.from(document.querySelectorAll('iframe')).forEach(iframe => {
                        Array.from(iframe.contentWindow.document.body.querySelectorAll('label'))
                            ?.find(e => e.textContent.startsWith('Format'))
                            ?.querySelector('a')
                            ?.click();
                        Array.from(iframe.contentWindow.document.body.querySelectorAll('a[role="menuitemcheckbox"]'))
                            ?.find(e => e.textContent === 'JSON')
                            ?.click();
                        Array.from(iframe.contentWindow.document.body.querySelectorAll('button'))
                            ?.find(el => el.textContent === 'Create File')
                            ?.click?.()
                    });
                `);
            });     
        });
    }

    async isDataRequestComplete(): Promise<boolean> {
        await this.verifyLoggedInStatus();

        return withSecureWindow<boolean>(this.windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve)
                window.loadURL('https://www.facebook.com/dyi/?referrer=yfi_settings&tab=all_archives');
            });

            // Find a div that reads 'A copy of your information is
            // being created'
            // 1. Retrieve all iframes in the website, as the right view is
            //    embedded in it
            // 2. Check if there is a span with "pending" in it
            return window.webContents.executeJavaScript(`
                !Array.from(document.querySelectorAll('iframe')).reduce((sum, iframe) => {
                    const spans = Array.from(iframe.contentWindow.document.body.querySelectorAll('span'));
                    const pending = spans.find(span => span.textContent === 'Pending');
                    return pending ? true : sum;
                }, false);
            `);
        });
    }

    async parseDataRequest(extractionPath: string): Promise<ProviderFile[]> {
        return withSecureWindow<ProviderFile[]>(this.windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('dom-ready', resolve)
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
                    Array.from(document.querySelectorAll('iframe')).reduce((sum, iframe) => {
                        const buttons = Array.from(iframe.contentWindow.document.body.querySelectorAll('button'));
                        const button = buttons.find(button => button.textContent === 'Download' || button.textContent === 'Download Again');
                        return button || sum;
                    }, null)?.click();
                `);

                window.show();
            });

            // We have the ZIP, all that's left to do is unpack it and pipe it to
            // the repository
            const zip = new AdmZip(filePath);
            await new Promise((resolve) => 
                zip.extractAllToAsync(extractionPath, true, resolve)
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