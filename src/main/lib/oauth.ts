import crypto from 'crypto';
import { EmailClient } from 'main/email-client/types';
import { KeyStore } from 'main/store';
import fetch, { RequestInit, Response } from 'node-fetch';

/**
 * Generate a secure code_verifier for further use with, e.g. Google Oauth
 */
export function generateVerifier(): string {
    // This is a verifier code used by the API to check stuff
    const randomString = crypto.randomBytes(96).toString('base64');

    // The valid characters in the code_verifier are [A-Z]/[a-z]/[0-9]/
    // "-"/"."/"_"/"~". Base64 encoded strings are pretty close, so we're just
    // swapping out a few chars.
    // src: https://github.com/googleapis/google-auth-library-nodejs/blob/d4e56c0937adbf9561d5ca3860a1bde623696db7/src/auth/oauth2client.ts#L560
    const verifier = randomString
        .replace(/\+/g, '~')
        .replace(/=/g, '_')
        .replace(/\//g, '-');

    return verifier;
}

/**
 * Convert a dictionary JS object to a URL-encoded parameter string
 */
export function objectToUrlParams(data: Record<string, unknown>) {
    return Object.keys(data).reduce((uri, key, i) => {
        return `${uri}${i === 0 ? '?' : '&'}${key}=${data[key]}`;
    }, '');
}


/**
 * This defines a basic object that can store tokens for OAuth-powered APIs.
 * Since they must include an access_token and refresh_token, these should be
 * the minimum of data that is necessary for use.
 */
export interface BaseTokenResponse {
    access_token: string;
    refresh_token: string;
}

/**
 * This is the base for an emal provider class that implements some helper
 * functions for dealing with OAuth-based APIs. This particularly concerns
 * catching access token expiries and re-trying the requests when a access token
 * has been renewed.
 */
export abstract class OauthEmailClient<T extends BaseTokenResponse = BaseTokenResponse> extends EmailClient {
    private tokens: T | null;

    /**
     * Implement a function that takes an existing token that might be expired,
     * exchanges it for a new token and returns it. 
     */
    abstract refreshTokens(tokens: T): Promise<T>;

    async delete(): Promise<void> {
        await KeyStore.delete(`${this.key}_${this.emailAddress}`);
    }

    /**
     * Retrieve the OAuth tokens for this client. 
     */
    async getTokens(): Promise<T> {
        if (this.isInitialized) {
            return this.tokens;
        }

        // Retrieve the tokens from the Keytar store and parse it as JSON
        const rawTokens = await KeyStore.get(`${this.key}_${this.emailAddress}`);
        const tokens = JSON.parse(rawTokens);
            
        // GUARD: Double-check that whats coming back from the store is
        // actually a token.
        if (!tokens) {
            throw new Error(`Email address '${this.emailAddress}' was supposed to be initialised already with the Gmail Client, but no tokens could be retrieved from the store.`);
        }

        // Store the tokens in the class and set the initialisation flag
        this.tokens = tokens;
        this.isInitialized = true;

        return tokens;
    }

    /**
     * Store a new set of tokens for this particular client.
     */
    async storeTokens(tokens: T, persist = true): Promise<void> {
        // GUARD: Optionally persist the key to the user's keychain. This should
        // only be done in cases where the email address is not yet available.
        // Any implementer setting persist to false is responsible for making
        // sure a later call is made to this function with the persist key set
        // to true.
        if (persist) {
            await KeyStore.set(`${this.key}_${this.emailAddress}`, JSON.stringify(tokens));
        }
        this.tokens = tokens;
        this.isInitialized = true;
    }

    /**
     * Send out a GET request to the Gmail API
     * @param url URL of the API endpoint
     * @param init Extra parameters to be sent along with the fetch request
     */
    async get(url: string, init: RequestInit = null, parseType: 'json' | 'text' = 'json'): Promise<unknown> {
        const tokens = await this.getTokens();
        // GUARD: Check if a token is present before sending request
        if (!tokens) {
            throw new Error('Cant refresh tokens if no tokens are present');
        }

        const options = {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
            },
            ...init,
        };

        return fetch(url, options)
            .then(this.tokenMiddleware(url, options))
            .then(this.errorMiddleware)
            .then((response) => response[parseType]());
    }

    /**
     * A piece of fetch middleware that checks if the response is of status 401.
     * If so, the access token has expired. It will fetch a new one and mount a
     * new request to continue the chain.
     */
    tokenMiddleware = (url: string, init: RequestInit = null): ((response: Response) => Promise<Response>) => {
        return async (response: Response): Promise<Response> => {
            // GUARD: Check if the token has expired
            if (response.status === 401) {
                // If so, refresh the token
                const expiredTokens = await this.getTokens();
                const tokens = await this.refreshTokens(expiredTokens);
                await this.storeTokens(tokens);
    
                // Then send out a new request
                return fetch(url, {
                    ...init,
                    headers: {
                        'Authorization': `Bearer ${tokens.access_token}`,
                    },
                });
            }
    
            return response;
        };
    };

    /**
     * Will pick off any responses that result in errors
     */
    async errorMiddleware(response: Response): Promise<Response> {
        if (response.status > 400) {
            const text = await response.text();
            throw new Error(`Error while sending request: ${text}`);
        }

        return response;
    }
}