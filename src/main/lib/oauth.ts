import crypto from 'crypto';

/**
 * Generate a secure code_verifier for further use with Google Oauth
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

import fetch, { RequestInit, Response } from 'node-fetch';

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
export abstract class OauthAutoRefreshingMiddleware {
    tokens: BaseTokenResponse | null;

    abstract refreshTokens(): void;

    /**
     * Send out a GET request to the Gmail API
     * @param url URL of the API endpoint
     * @param init Extra parameters to be sent along with the fetch request
     */
    async get(url: string, init: RequestInit = null, parseType: 'json' | 'text' = 'json'): Promise<unknown> {
        // GUARD: Check if a token is present before sending request
        if (!this.tokens) {
            throw new Error('Cant refresh tokens if no tokens are present');
        }

        const options = {
            headers: {
                'Authorization': `Bearer ${this.tokens.access_token}`,
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
                await this.refreshTokens();
    
                // Then send out a new request
                return fetch(url, {
                    ...init,
                    headers: {
                        'Authorization': `Bearer ${this.tokens.access_token}`,
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