import { ProviderFile, DataRequestProvider, WithWindow } from '../types';
import crypto from 'crypto';
import path from 'path';
import fetch from 'node-fetch';
import { BrowserWindow, WebRequest, webContents, app } from 'electron';
import scrapingUrls from './urls.json';
import AdmZip from 'adm-zip';
import fs from 'fs';
import createSecureWindow from 'main/lib/create-secure-window';

const requestSavePath = path.join(app.getAppPath(), 'data');

class Instagram extends DataRequestProvider implements WithWindow {
    key = 'instagram';
    dataRequestIntervalDays = 5;

    window: BrowserWindow;
    cookies: Electron.Cookie[] = [];

    constructor() {
        super();

        this.window = createSecureWindow('https://instagram.com');

        // this.window.webContents.session.clearStorageData();
    }

    async initialise(): Promise<boolean> {
        await this.verifyLoggedInStatus();

        return true;
    }

    verifyLoggedInStatus = async (): Promise<void> => {
        // Load a URL in the browser, and see if we get redirected or not
        const profileUrl = 'https://www.instagram.com/accounts/access_tool/ads_interests';
        this.window.loadURL(profileUrl);

        // TODO: Introduce optimisation so that we don't have to issue the
        // request every time
        this.cookies = await new Promise((resolve) => {
            const eventHandler = async (): Promise<void> => {
                // Check if we ended up at the right page
                if (profileUrl === this.window.webContents.getURL()) {
                    // If we did, we can siphon off the cookies from this page
                    // for API requests
                    const cookies = await this.window.webContents.session.cookies.get({});
                    
                    // Do a check if the language is set to English, and if not,
                    // change it to English
                    const lang = cookies.find(cookie => cookie.name === 'ig_lang');
                    if (lang?.value !== 'en') {
                        await this.window.webContents.session.cookies.set({ 
                            url: 'https://instagram.com',
                            name: 'ig_lang',
                            value: 'en',
                            domain: '.instagram.com',
                            secure: true,
                            expirationDate: Math.pow(2, 31) - 1,
                        });
                    }

                    // We can then return the cookies and clean up the window
                    this.window.hide();
                    this.window.webContents.removeListener('did-navigate', eventHandler);
                    resolve(cookies);
                } else if (!this.window.isVisible()) {
                    // If not, we'll check if we need to open the window for the
                    // user to enter their credentials.
                    this.window.show();
                }
            };

            this.window.webContents.on('did-navigate', eventHandler);
            this.window.webContents.once('did-finish-load', eventHandler);
        });
    }

    update = async (): Promise<ProviderFile[]> => {
        await this.verifyLoggedInStatus();

        // We extract the right cookies, and create a config we can then
        // use for successive requests
        const sessionid = this.cookies.find(cookie => cookie.name === 'sessionid').value;
        // const shbid = this.cookies.find(cookie => cookie.name === 'shbid').value;
        const fetchConfig =  {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Referer: 'https://www.instagram.com/accounts/access_tool/ads_interests',
                'X-CSRFToken': crypto.randomBytes(20).toString('hex'),
                cookie: `sessionid=${sessionid}; shbid=${''}`
            },
        };

        // Now we do all API requests in order to retrieve the data
        const responses = await Promise.all(
            scrapingUrls.map(url => 
                fetch(url, fetchConfig).then(response => response.json())
            )
        );

        console.log(responses);

        // We then transform the data so that we can return it to the handler
        return responses.map(response => {
            return {
                filepath: `${response.page_name}.json`,
                data: JSON.stringify(response.data.data, null, 4),
            };
        });
    }

    async dispatchDataRequest(): Promise<void> {
        await this.verifyLoggedInStatus();

        // Load the dispatched window
        this.window.show();
        await this.window.loadURL('https://www.instagram.com/download/request/');

        // And now we dive into the page contents to dispatch the request
        const button = await this.window.webContents.executeJavaScript(`
            let nextButton = Array.from(document.querySelectorAll('button'))
                .find(el => el.textContent === 'Next');
            nextButton;
        `);

        // GUARD: The button's value must be 'Next' 
        console.log('BUTTON', button);
        if (!button) {
            throw new Error('UnknownPageState');
        }

        // Now that we've found the button, we trigger it.
        await this.window.webContents.executeJavaScript(`
            nextButton.click();
        `);

        // Now we must defer the page to the user, so that they can enter their
        // password. We then listen for a succesfull AJAX call 
        await new Promise((resolve) => {
            this.window.webContents.session.webRequest.onCompleted({
                urls: [ 'https://*.instagram.com/*' ]
            }, (details: any) => {
                console.log('NEW REQUEST', details);
            });
        })
        
    }

    async isDataRequestComplete(): Promise<boolean> {
        await this.verifyLoggedInStatus();

        console.log('Verified login status');

        // Load page URL
        this.window.show();
        await new Promise((resolve) => {
            this.window.webContents.on('did-finish-load', resolve)
            this.window.loadURL('https://www.instagram.com/download/request/');
        });

        console.log('Verification page is loaded');
        
        // Find a heading that reads 'Your Download is Ready'
        return this.window.webContents.executeJavaScript(`
            !!Array.from(document.querySelectorAll('h1'))
                .find(el => el.textContent === 'Your Download is Ready');
        `);
    }

    async parseDataRequest(): Promise<ProviderFile[]> {
        console.log('Started parsing request');

        // We'll force a click on the button
        await new Promise((resolve) => {
            // Now we defer to the user to enter their credentials
            this.window.webContents.once('did-navigate', resolve); 
            this.window.webContents.executeJavaScript(`
                Array.from(document.querySelectorAll('button'))
                    .find(el => el.textContent === 'Log In Again')
                    .click?.()
            `);
        });

        console.log('Page navigated after button press');

        // We can now show the window for the login screen
        this.window.show();

        // Then we'll await the navigation back to the data download page from
        // the login page
        await new Promise((resolve) => {
            this.window.webContents.once('will-navigate', resolve); 
        });

        console.log('Credentials were successfully entered');

        // We can now close the window
        this.window.hide();

        // Now that we're successfully authenticated on the data download page,
        // the only thing we have to do is download the data.
        const filePath = path.join(requestSavePath, 'instagram.zip');
        await new Promise((resolve) => {
            // Create a handler for any file saving actions
            this.window.webContents.session.once('will-download', (event, item) => {
                // Save the item to the data folder temporarily
                item.setSavePath(filePath);
                item.once('done', resolve);
            });

            // And then trigger the button click
            this.window.webContents.executeJavaScript(`
                Array.from(document.querySelectorAll('button'))
                    .find(el => el.textContent === 'Download Data')
                    .click?.()
            `);
        });

        // We have the ZIP, all that's left to do is unpack it and pipe it to
        // the repository
        const zip = new AdmZip(filePath);

        // Translate this into a form that is readable for the ParserManager
        const files = zip.getEntries().map((entry): ProviderFile => {
            return {
                filepath: entry.entryName,
                data: entry.getData(),
            };
        });

        // And dont forget to remove the zip file after it's been processed
        await fs.promises.unlink(filePath);

        return files;
    }
}

export default Instagram;