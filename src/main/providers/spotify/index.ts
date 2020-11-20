import { subHours } from 'date-fns';
import { withSecureWindow } from 'main/lib/create-secure-window';
import { EmailDataRequestProvider, ProviderFile } from '../types';

class Spotify extends EmailDataRequestProvider {
    public static key = 'spotify';
    public static dataRequestIntervalDays = 5;

    windowParams = {
        key: this.windowKey,
        origin: 'spotify.com'
    }

    async initialise(): Promise<string> {
        await this.verifyLoggedInStatus();
        return this.accountName;
    }

    verifyLoggedInStatus = async (): Promise<Electron.Cookie[]> => {
        return withSecureWindow<Electron.Cookie[]>(this.windowParams, (window) => {
            const settingsUrl = 'https://www.spotify.com/us/account/privacy/';
            window.loadURL(settingsUrl);

            return new Promise((resolve) => {
                const eventHandler = async(): Promise<void> => {
                    // Check if we ended up at the page in an authenticated form
                    if (settingsUrl === window.webContents.getURL()) {
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
        // NOTE: Updating is not supported by Spotify at this point
        return false;
    }

    dispatchDataRequest = async (): Promise<void> => {
        await this.verifyLoggedInStatus();

        return withSecureWindow<void>(this.windowParams, async (window) => {
            window.hide();

            await new Promise((resolve) => {
                window.webContents.on('did-finish-load', resolve)
                window.loadURL('https://www.spotify.com/us/account/privacy/');
            });

            // Now we must defer the page to the user, so that they can confirm
            // the request. We then listen for a succesfull AJAX call 
            await new Promise((resolve) => {
                window.webContents.session.webRequest.onCompleted({
                    urls: [ 'https://*.spotify.com/*' ]
                }, (details: Electron.OnCompletedListenerDetails) => {
                    if (details.url.startsWith('https://www.spotify.com/us/account/privacy/download')
                        && details.statusCode === 200) {
                        resolve();
                    }
                });

                // Ensure that the data request is in JSON format
                window.webContents.executeJavaScript(`
                    document.querySelector('button#privacy-open-request-download-modal-button')
                        .click();
                `);

                window.show();
            });     

            // Then, we'll poll for a particular email from Spotify coming in
            // that we have to click a link from
            return this.recursivelyWaitForConfirmationEmail();
        });
    }

    async recursivelyWaitForConfirmationEmail(): Promise<void> {
        const [ message ] = await this.email.findMessages({
            from: 'noreply@spotify.com'
        });

        // Check if there is a message and that it has a date
        if (message && message.date) {
            // Then check if it's been sent over in the last two hours
            const reference = subHours(new Date, 2);
            if (reference < message.date) {
                // If so, we find the link and click it
                console.log(message)
                return;
            }
        }

        // If the mail was not found, wait 15 seconds and execute this method again.
        await new Promise(resolve => setTimeout(resolve, 15_000));
        return this.recursivelyWaitForConfirmationEmail();
    }

    async isDataRequestComplete(): Promise<boolean> {
        await this.verifyLoggedInStatus();

        return withSecureWindow<boolean>(this.windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve)
                window.loadURL('https://www.spotify.com/us/account/privacy/');
            });

            // Check if the third div is grayed out
            return window.webContents.executeJavaScript(`
                !Array.from(document.querySelector('.privacy-download-step-3').classList)
                    .includes('privacy-grayed-step')
            `);
        });
    }

    async parseDataRequest(): Promise<ProviderFile[]> {
        return [];
        /*
        return withSecureWindow<ProviderFile[]>(this.windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('dom-ready', resolve)
                window.loadURL('https://www.spotify.com/us/account/privacy/');
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
                    Array.from(document.querySelectorAll('button'))
                        .find(el => el.textContent === 'Download' || el.textContent === 'Download Again')
                        .click();
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
        */
    }
}

export default Spotify;