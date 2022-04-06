import { ProviderFile } from '../types';
import { EmailDataRequestProvider } from '../types/Provider';
import crypto from 'crypto';
import path from 'path';
import fetch from 'node-fetch';
import { app } from 'electron';
import scrapingUrls from './urls.json';
import AdmZip from 'adm-zip';
import fs from 'fs';
import { withSecureWindow } from 'main/lib/create-secure-window';
import logger from 'main/lib/logger';

const requestSavePath = path.join(app.getAppPath(), 'data');

const downloadUrlRegex = /https:\/\/www\.instagram\.com\/dyi\/download\/auth\/([a-zA-Z\d]+)\/\?dyi_job_id=([a-zA-Z\d]+)/;

class Instagram extends EmailDataRequestProvider {
    public static key = 'instagram';

    public static dataRequestIntervalDays = 5;

    public static requiresEmailAccount = false;

    /**
     * The parameters to be stored for the secure windows
     */
    windowParams = {
        key: this.windowKey,
        origin: 'instagram.com',
    };

    async initialise(): Promise<string> {
        await this.verifyLoggedInStatus();
        return this.getAccountName();
    }

    /**
     * Retrieve the username for this account
     */
    async getAccountName(): Promise<string> {
        return withSecureWindow<string>(this.windowParams, async (window) => {
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve);
                window.loadURL('https://www.instagram.com/accounts/edit/');
            });

            return window.webContents.executeJavaScript(`
                document.querySelector('input#pepEmail').value
            `) as Promise<string>;
        });
    }

    verifyLoggedInStatus = async (): Promise<Electron.Cookie[]> => {
        return withSecureWindow<Electron.Cookie[]>(this.windowParams, (window) => {
            // Load a URL in the browser, and see if we get redirected or not
            const profileUrl = 'https://www.instagram.com/accounts/access_tool/ads_interests';
            window.loadURL(profileUrl);

            // TODO: Introduce optimisation so that we don't have to issue the
            // request every time
            return new Promise((resolve) => {
                const eventHandler = async (): Promise<void> => {
                    // Check if we ended up at the right page
                    if (profileUrl === window.webContents.getURL()) {
                        // If we did, we can siphon off the cookies from this page
                        // for API requests
                        const cookies = await window.webContents.session.cookies.get({});
                        
                        // Do a check if the language is set to English, and if not,
                        // change it to English
                        const lang = cookies.find((cookie) => cookie.name === 'ig_lang');
                        if (lang?.value !== 'en') {
                            await window.webContents.session.cookies.set({ 
                                url: 'https://instagram.com',
                                name: 'ig_lang',
                                value: 'en',
                                domain: '.instagram.com',
                                secure: true,
                                expirationDate: Math.pow(2, 31) - 1,
                            });
                        }

                        // We can then return the cookies and clean up the window
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

    update = async (): Promise<ProviderFile[]> => {
        const cookies = await this.verifyLoggedInStatus();

        // We extract the right cookies, and create a config we can then
        // use for successive requests
        const sessionid = cookies.find((cookie) => cookie.name === 'sessionid').value;
        // const shbid = this.cookies.find(cookie => cookie.name === 'shbid').value;
        const fetchConfig =  {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Referer: 'https://www.instagram.com/accounts/access_tool/ads_interests',
                'X-CSRFToken': crypto.randomBytes(20).toString('hex'),
                cookie: `sessionid=${sessionid}; shbid=${''}`,
            },
        };

        // Now we do all API requests in order to retrieve the data
        const responses = await Promise.all(
            scrapingUrls.map((url) => 
                fetch(url, fetchConfig).then((response) => response.json()),
            ),
        );

        // We then transform the data so that we can return it to the handler
        return responses.map((response: any) => {
            return {
                filepath: `${response.page_name}.json`,
                data: JSON.stringify(response.data.data, null, 4),
            };
        });
    };

    async dispatchDataRequest(): Promise<number> {
        await this.verifyLoggedInStatus();

        return withSecureWindow<number>(this.windowParams, async (window) => {
            // Load the dispatched window
            window.hide();
            await new Promise((resolve) => {
                window.webContents.on('did-finish-load', resolve);
                window.loadURL('https://www.instagram.com/download/request/');
            });

            // Set the output format to JSON
            window.webContents.executeJavaScript(`
                document.querySelector('input[value="JSON"]')?.click();
            `);

            // We'll click the button for the user, but we'll need to defer to the
            // user for a password
            window.webContents.executeJavaScript(`
                Array.from(document.querySelectorAll('button'))
                    .find(el => el.textContent === 'Next')
                    .click?.()
            `);
            window.show();

            // Now we must defer the page to the user, so that they can enter their
            // password. We then listen for a succesfull AJAX call 
            return new Promise((resolve) => {
                window.webContents.session.webRequest.onCompleted({
                    urls: [ 'https://www.instagram.com/download/request_download_data_ajax/' ],
                }, (details: Electron.OnCompletedListenerDetails) => {
                    if (details.statusCode === 200) {
                        // Return the current UNIX time so we can filter on emails later
                        resolve(Math.floor(new Date().getTime() / 1000));
                    }
                });
            });             
        });
    }

    async parseEmailForDownloadUrl(date: number): Promise<string | undefined> {
        // Attempt to retrieve emails
        const emails = await this.email.findMessages({
            from: 'security@mail.instagram.com',
            after: date,
        });

        let match: string | undefined;
        for (const email of emails) {
            // GUARD: Check that the email has a body
            if (!email.html) {
                continue;
            }

            match = email.html
                // Replace any weird line endinges
                .replace('=\n', '')
                // Then check if there's a download URL in there
                .match(downloadUrlRegex)[0];

            // GUARD: If a match is found, break the loop
            if (match) {
                break;
            }
        }

        return match;
    }

    async isDataRequestComplete(date: number): Promise<boolean> {
        await this.verifyLoggedInStatus();
        return !!(await this.parseEmailForDownloadUrl(date));
    }

    async parseDataRequest(extractionPath: string, date: number): Promise<ProviderFile[]> {
        const downloadUrl = await this.parseEmailForDownloadUrl(date);

        if (!downloadUrl) {
            throw new Error('Couldn\'t parse download URL from email');
        }

        return withSecureWindow<ProviderFile[]>(this.windowParams, async (window) => {
            logger.provider.info('Started parsing request');

            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve);
                window.loadURL(downloadUrl);
            });

            // Show the reauthentication window to the user
            await new Promise<void>((resolve) => {
                window.webContents.on('did-navigate', (event, url) => {
                    if (url.startsWith('https://www.instagram.com/download/confirm')) {
                        resolve();
                    }
                });
                window.show();
            });

            // We can now close the window
            window.hide();

            // Now that we're successfully authenticated on the data download page,
            // the only thing we have to do is download the data.
            const filePath = path.join(requestSavePath, 'instagram.zip');
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
                        .find(el => el.textContent === 'Download Information')
                        .click?.()
                `);
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
                };
            });

            // And dont forget to remove the zip file after it's been processed
            await fs.promises.unlink(filePath);

            return files;
        });
    }
}

export default Instagram;