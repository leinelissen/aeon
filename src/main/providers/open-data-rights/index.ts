import { ProviderFile } from '../types';
import { OpenDataRightsProvider } from "../types/Provider";
import fetch, { RequestInit } from 'node-fetch';
import store from 'main/store';
import AdmZip from 'adm-zip';
import { withSecureWindow } from 'main/lib/create-secure-window';

type Token = {
    access_token: string;
    refresh_token: string;
}

class OpenDataRights extends OpenDataRightsProvider {
    public static key = 'open-data-rights';
    public static dataRequestIntervalDays = 1;

    private token: Token | null;

    constructor (windowKey: string, accountName?: string) {
        super(windowKey, accountName);
        this.token = store.get(this.windowKey, null) as Token | null;
    }

    getInit = (): RequestInit => {
        return {
            headers: {
                'Authorization': `Bearer ${this.token.access_token}`
            }
        }
    }

    async initialise(): Promise<string> {
        const code = await withSecureWindow<string>(this.windowParams, async (window) => {
            // Load the redirect URI in the window
            const url = `${this.url}/oauth/authorize?redirect_uri=${encodeURIComponent('aeon://odr-callback')}`;
            await window.loadURL(url);
            window.show();

            // Wait for any changes in location
            return new Promise((resolve) => {
                const eventHandler = () => {
                    if (window.webContents.getURL().startsWith('aeon://odr-callback')) {
                        const url = window.webContents.getURL().replace('aeon://odr-callback', '');
                        const token = new URLSearchParams(url).get('token');
                        resolve(token);
                    }
                };

                window.webContents.on('did-navigate', eventHandler);
                window.webContents.once('did-finish-load', eventHandler);
            });
        });

        // Gather form parameters
        const formData = new URLSearchParams();
        formData.append('code', code);

        // Exchange token for access token
        this.token = await fetch(`${this.url}/oauth/token`, {
            method: 'POST',
            body: formData,
        }).then(response => response.json());

        // Also save it to disk
        store.set(this.windowKey, this.token);

        // Now we just need to fetch the account
        return fetch(`${this.url}/data/me`, this.getInit())
            .then(response => response.json())
            .then(response => response.account);
    }

    async update(): Promise<false> {
        // NOTE: Updating is not supported by Facebook since it's internal API
        // is a enormous clusterfuck and cannot be trusted.
        return false;
    }

    dispatchDataRequest = async(): Promise<string> => {
        return fetch(`${this.url}/requests`, {
            ...this.getInit(),
            method: 'POST',
        }).then(response => response.json())
            .then(response => response.requestId);
    }

    isDataRequestComplete = (identifier: string): Promise<boolean> => {
        return fetch(`${this.url}/requests/${identifier}/complete`, this.getInit())
            .then(response => response.text())
            .then(response => response === '1');
    }

    parseDataRequest = async (extractionPath: string, identifier: string): Promise<ProviderFile[]> => {
        // Retrieve the archive from the API
        const archive = await fetch(`${this.url}/requests/${identifier}/download`, this.getInit())
            .then(response => response.buffer());

        // Then pass it over to adm-zip
        const zip = new AdmZip(archive);
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

        return files;
    }
}

export default OpenDataRights;