import http from 'http';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { Socket } from 'net';
import { shell } from 'electron';
import { GmailTokenResponse } from './types';
import logger from 'main/lib/logger';
import { generateVerifier, objectToUrlParams } from 'main/lib/oauth';

// Pull the Gmail config variables from the environment
const GMAIL_OAUTH_CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID;
const GMAIL_OAUTH_CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET;

interface CodeAndRedirectUri {
    code: string;
    redirect_uri: string;
}

/**
 * Exchange a received authorization code for a full blown access token
 * @param response 
 * @param verifier 
 */
async function exchangeAccessCode(response: CodeAndRedirectUri, verifier: string): Promise<GmailTokenResponse> {
    // Gather form parameters
    const formData = new URLSearchParams();
    formData.append('code', response.code);
    formData.append('client_id', GMAIL_OAUTH_CLIENT_ID);
    formData.append('client_secret', GMAIL_OAUTH_CLIENT_SECRET);
    formData.append('code_verifier', verifier);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', response.redirect_uri);

    // Send out request
    return fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: formData,
    }).then((res) => res.json() as Promise<GmailTokenResponse>);
}

type CodeCallback = (code: CodeAndRedirectUri) => void;

/**
 * We authenticate using the local loopback method. This requires that we start
 * a local webserver in order to catch the redirect.
 */
async function setupRedirectListener(callback: CodeCallback): Promise<string> {
    return new Promise((resolve, reject) => {
        // Store the redirect_uri for use
        let redirectUri: string = null;

        // Store any sockets so that we can forcibly delete them
        const sockets = new Set<Socket>();

        // Create basic server that logs incoming requests
        const server = http.createServer((req, res) => {
            // Write reponse
            res.writeHead(200);
            res.end('Your account has been successfully connected. You can close this window and return to Aeon.');

            // Parse parameters
            const params = new URL(`http://localhost${req.url}`).searchParams;

            // GUARD: The response must have a code and scope parameter
            if (params.has('code') && params.has('scope')) {
                // First, we'll shutdown the server, by closing it and forcibly
                // destroying all sockets.
                server.close();
                for (const socket of sockets) {
                    socket.destroy();
                }
                logger.email.info(`Received authentication code, ${redirectUri} destroyed.`);

                // Lastly, we'll pass along the code and redirect uri to the
                // callback handler
                callback({
                    code: params.get('code'),
                    redirect_uri: redirectUri,
                });
            }
        });

        // Assign listener that returns server object when ready
        server.on('listening', () => {
            // Retrieve the server port
            const address = server.address();

            // Double-check that the address is TCP
            if (typeof address === 'string') {
                throw new Error('Could not retrieve port from HTTP server...');
            }

            // Assign the redirect_uri for later use
            redirectUri = new URL(`http://127.0.0.1:${address.port}`).toString();
            
            // Then resolve it
            resolve(redirectUri);

            // Also log it
            logger.email.info('A gmail authentication server is listening at: ' + redirectUri);
        });

        // Store any sockets, so that we can delete them when the server is done
        server.on('connection', (socket) => {
            sockets.add(socket);

            // Also auto-remove them when the socket gets closed
            socket.on('close', () => {
                sockets.delete(socket);
            });
        });

        server.on('error', reject);

        // Start listening on a random OS-assigned port
        server.listen(0);
    });
}

export function refreshGmailTokens(refresh_token: string): Promise<GmailTokenResponse> {
    // Gather form parameters
    const formData = new URLSearchParams();
    formData.append('refresh_token', refresh_token);
    formData.append('client_id', GMAIL_OAUTH_CLIENT_ID);
    formData.append('client_secret', GMAIL_OAUTH_CLIENT_SECRET);
    formData.append('grant_type', 'refresh_token');

    // Send out request
    return fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: formData,
    }).then((response) => response.json() as Promise<GmailTokenResponse>)
        .then((response) => ({
            ...response,
            refresh_token,
        }));
}

async function retrieveAuthenticationCode(verifier: string): Promise<CodeAndRedirectUri> {
    if (!GMAIL_OAUTH_CLIENT_ID || !GMAIL_OAUTH_CLIENT_SECRET) {
        throw new Error('GMAIL_OAUTH_CLIENT_ID and/or GMAIL_OAUTH_CLIENT_SECRET wasn\'t set in the environment');
    }

    // eslint-disable-next-line
    return new Promise(async (resolve) => {
        // Create server and retrieve redirect URI
        const redirectUri = await setupRedirectListener(resolve);

        // POST parameters for the redirect URI request
        const data: Record<string, string> = {
            scope: 'https://mail.google.com/',
            response_type: 'code',
            code_challenge: verifier,
            redirect_uri: redirectUri,
            client_id: GMAIL_OAUTH_CLIENT_ID,
        };
        const params = objectToUrlParams(data);
        const uri = new URL('https://accounts.google.com/o/oauth2/v2/auth' + params);

        // Then open the generated URL in the OS-default browser
        shell.openExternal(uri.href);
    });
}

/**
 * Starts the authentication workflow for a Gmail-based email API
 */
export default async function authenticateGmailUser(): Promise<GmailTokenResponse> {
    const verifier = generateVerifier();
    const response = await retrieveAuthenticationCode(verifier);
    const tokens = await exchangeAccessCode(response, verifier);
    return tokens;
}