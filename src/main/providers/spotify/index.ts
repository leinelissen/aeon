import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { subHours } from 'date-fns';
import { withSecureWindow } from 'main/lib/create-secure-window';
import { ProviderFile } from '../types';
import { EmailDataRequestProvider } from "../types/Provider";

class Spotify extends EmailDataRequestProvider {
    public static key = 'spotify';
    public static dataRequestIntervalDays = 5;

    windowParams = {
        key: this.windowKey,
        origin: 'spotify.com'
    }

    async initialise(): Promise<string> {
        console.log('Initialising new spotify account');
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

        await withSecureWindow<void>(this.windowParams, async (window) => {
            window.hide();

            await new Promise((resolve) => {
                window.webContents.on('did-finish-load', resolve)
                window.loadURL('https://www.spotify.com/us/account/privacy/');
            });

            // Now we must defer the page to the user, so that they can confirm
            // the request. We then listen for a succesfull AJAX call 
            await new Promise((resolve) => {
                window.webContents.session.webRequest.onCompleted({
                    urls: [ 
                        'https://www.spotify.com/us/account/privacy/download/*',
                        'https://www.spotify.com/us/account/privacy/resend-confirmation-email/*'
                    ]
                }, (details: Electron.OnCompletedListenerDetails) => {
                    if (details.statusCode === 200) {
                        resolve();
                    }
                });

                // Ensure that the data request is in JSON format
                window.webContents.executeJavaScript(`
                    const rqst = document.querySelector('button#privacy-open-request-download-modal-button');
                    rqst?.offsetParent 
                        ? rqst.click()
                        : document.querySelector('button.resend-email-button')?.click();
                `);

                window.show();
            });     
        });

        // Then, we'll poll for a particular email from Spotify coming in
        // that we have to click a link from
        return this.recursivelyWaitForConfirmationEmail();
    }

    /**
     * A function that will poll the email account linked to this provider, to
     * check for a particular email with a confirmation link. If it is found,
     * the link is opened and the Promise is resolved.
     */
    async recursivelyWaitForConfirmationEmail(): Promise<void> {
        // Retrieve all messages from Spotify from the server
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
                const [link] = message.text.match(/https:\/\/www\.spotify\.com\/account\/privacy\/download\/confirm\/[a-f\d]+/);

                // GUARD: Check if the link is correctly extracted, else we
                // might be in the wrong email
                if (link) {
                    // If so, we open a new window in which we open the link
                    return withSecureWindow(this.windowParams, window => {
                        return window.loadURL(link);
                    });
                }
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

    async parseDataRequest(extractionPath: string): Promise<ProviderFile[]> {
        // Get the download link
        const [message] = await this.email.findMessages({
            from: 'noreply@spotify.com',
        });
        
        // GUARD: Double-check that message.text exists
        if(!message.text) {
            throw new Error('Failed to find email text for Spotify');
        }

        const [downloadLink] = message.text.match(/https:\/\/www\.spotify\.com\/account\/privacy\/download\/retrieve\/[a-f\d]+/);
        
        // GUARD: Check if the download link was successfully retrieved
        if (!message || !downloadLink) {
            throw new Error('Could not find download link in email for Spotify');
        }

        // Open a window with the download link
        return withSecureWindow<ProviderFile[]>(this.windowParams, async (window) => {
            const filePath = path.join(extractionPath, 'spotify.zip');
            await new Promise((resolve) => {
                // Create a handler for any file saving actions
                window.webContents.session.once('will-download', (event, item) => {
                    // Save the item to the data folder temporarily
                    item.setSavePath(filePath);
                    item.once('done', resolve);
                });

                // And then open the URL and show the window
                // TODO: Check if an additional click is necessary
                window.loadURL(downloadLink);
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
                };
            });

            // And dont forget to remove the zip file after it's been processed
            await fs.promises.unlink(filePath);

            return files;
        });
    }
}

export default Spotify;