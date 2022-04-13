import { withSecureWindow } from 'main/lib/create-secure-window';
import crypto from 'crypto';
import { generateVerifier, objectToUrlParams } from 'main/lib/oauth';
import fetch from 'node-fetch';

// Pull the Outlook config variables from the environment
const OUTLOOK_OAUTH_CLIENT_ID = process.env.OUTLOOK_OAUTH_CLIENT_ID;
const OUTLOOK_OAUTH_CLIENT_SECRET = process.env.OUTLOOK_OAUTH_CLIENT_SECRET;

// OAuth constants
const REDIRECT_URI = 'https://login.microsoftonline.com/common/oauth2/nativeclient';
const SCOPES = [
    'User.Read',
    'Mail.Read',
];

export interface OutlookTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    refresh_token: string,
    id_token: string;
    windowKey: string;
}

interface TokenError {
    error: string;
    error_description: string;
    error_codes: number[];
    timestamp: string;
    trace_id: string;
    correlation_id: string;
}

/**
 * Attemps to authenticate an Outlook user
 */
export default async function authenticateOutlookUser(): Promise<OutlookTokenResponse> {
    // GUARD: Check that the env variables were set
    if (!OUTLOOK_OAUTH_CLIENT_ID || !OUTLOOK_OAUTH_CLIENT_SECRET) {
        throw new Error('OUTLOOK_OAUTH_CLIENT_ID and/or OUTLOOK_OAUTH_CLIENT_SECRET wasn\'t set in the environment');
    }
    
    // Prepare the oauth auth params
    const verifier = generateVerifier();
    const authSettings = {
        client_id: OUTLOOK_OAUTH_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: SCOPES.join(','),
        response_mode: 'query',
        code_challenge: verifier,
        code_challenge_method: 'plain',
    };

    // Convert the params to a full URI
    const authParams = objectToUrlParams(authSettings);
    const authUri = new URL('https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize' + authParams);
    
    // Spawn window pointing the user to the Microsoft Graph OAuth flow
    const windowKey = crypto.randomBytes(32).toString('hex');
    const authToken = await withSecureWindow<string>({
        key: windowKey,
        origin: ['microsoftonline.com', 'live.com'],
    }, (window) => {
        return new Promise((resolve, reject) => {
            // Load the URL for the user
            window.loadURL(authUri.href);
            window.show();
    
            // Check for navigation towards the redirect URI
            window.webContents.on('did-navigate', () => {
                const responseUri = window.webContents.getURL();
                if (!responseUri.startsWith(REDIRECT_URI)) {
                    return;
                }

                // Parse the url and extract the token
                const tokenParams = new URL(responseUri).searchParams;

                // GUARD: Check for errors
                if (tokenParams.has('error')) {
                    reject(`Outlook OAuth request failed with error code '${tokenParams.get('error')}' (${tokenParams.get('error_description')})`);
                    return;
                }

                // GUARD: Check the token is there
                if (!tokenParams.has('code')) {
                    reject('No token could be found in OAuth response for Outlook');
                    return;
                }

                resolve(tokenParams.get('code'));
            });
        });
    });

    // Then exchange the token for an access token
    const tokenParams = new URLSearchParams();
    tokenParams.append('client_id', OUTLOOK_OAUTH_CLIENT_ID);
    tokenParams.append('scope', SCOPES.join(','));
    tokenParams.append('code', authToken);
    tokenParams.append('redirect_uri', REDIRECT_URI);
    tokenParams.append('code_verifier', verifier);
    tokenParams.append('grant_type', 'authorization_code');
    
    // Send off the request to the API
    const tokenUri = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
    const tokenResponse = await fetch(tokenUri, { 
        method: 'POST',
        body: tokenParams,
    }).then((r) => r.json()) as OutlookTokenResponse | TokenError;

    // GUARD: Check for errors in exchanging the token
    if ('error' in tokenResponse) {
        throw new Error(`Failed to exchange auth token for access token in Outlook email client. Error code: '${tokenResponse.error}' (${tokenResponse.error_description})`);
    } else {
        // Append the windowKey to the tokenResponse
        tokenResponse.windowKey = windowKey;

        return tokenResponse;
    }
}

/**
 * Exchange a previously received refresh_token for a new access_token
 */
export async function refreshOutlookTokens({ refresh_token, windowKey }: OutlookTokenResponse) {
    const refreshParams = new URLSearchParams();
    refreshParams.append('client_id', OUTLOOK_OAUTH_CLIENT_ID);
    refreshParams.append('grant_type', refresh_token);
    refreshParams.append('scope', SCOPES.join(','));
    refreshParams.append('refresh_token', refresh_token);
    const refreshUri = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';

    // Send off the request to the API
    const tokenResponse = await fetch(refreshUri, {
        method: 'POST',
        body: refreshParams,
    }).then((r) => r.json()) as OutlookTokenResponse | TokenError;

    // GUARD: Check for errors in exchanging the token
    if ('error' in tokenResponse) {
        throw new Error(`Failed to exchange auth token for access token in Outlook email client. Error code: '${tokenResponse.error}' (${tokenResponse.error_description})`);
    } else {
        // Append the windowKey to the tokenResponse
        tokenResponse.windowKey = windowKey;

        return tokenResponse;
    }
}