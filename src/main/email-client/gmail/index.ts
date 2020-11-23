import store from 'main/store';
import fetch, { RequestInit, Response } from 'node-fetch';
import authenticateGmailUser, { refreshGmailTokens } from './oauth';
import { TokenResponse } from './types';
import { Email, EmailClient, EmailQuery } from '../types';
import { simpleParser } from 'mailparser';
import Mail from 'nodemailer/lib/mailer';
import MailComposer from 'nodemailer/lib/mail-composer';

interface ListResponse {
    messages: {
        id: string;
    }[]
}

interface MessageResponse {
    raw: string;
}

export default class GmailEmailClient implements EmailClient {
    tokens: TokenResponse | null;
    isInitialized: boolean;
    emailAddress?: string;

    /**
     * 
     * @param emailAddress 
     */
    constructor(emailAddress: string = null) {
        // GUARD: If an emailaddress has been specified, we should be able to
        // retrieve the tokens from the store. This also means the address has
        // already been initialised, as we know it.
        if (emailAddress) {
            const tokens = store.get(`gmail_${emailAddress}`, null) as TokenResponse | null;
            
            // GUARD: Double-check that whats coming back from the store is
            // actually a token.
            if (!tokens) {
                throw new Error(`Emailaddress '${emailAddress}' was supposed to be initialised already with the Gmail Client, but no tokens could be retrieved from the store.`);
            }

            this.tokens = tokens;
            this.emailAddress = emailAddress;
        }

        // Then we set the right initialisation flag
        this.isInitialized = !!this.tokens;
    }

    async initialize(): Promise<string> {
        // Retrieve the tokens
        const tokens = await authenticateGmailUser();
        this.tokens = tokens;

        // Retrieve the email address
        this.emailAddress = await this.getEmailAddress();

        // Save the tokens
        store.set(`gmail_${this.emailAddress}`, tokens);
        this.isInitialized = true;

        return this.emailAddress;
    }

    delete(): void {
        // Remove the tokens that are stored in the store
        store.delete(`gmail_${this.emailAddress}`);
    }

    async refreshTokens(): Promise<void> {
        // GUARD: Check if a token has already been retrieved
        if (!this.tokens) {
            throw new Error('Cant refresh tokens if no tokens are present');
        }

        // If so, refresh the token
        const tokens = await refreshGmailTokens(this.tokens.refresh_token);

        // Save the tokens
        this.tokens = tokens;
        store.set(`gmail_${this.emailAddress}`, tokens);
    }

    async findMessages(query: EmailQuery): Promise<Email[]> {
        // First we'll need to convert the query object
        const q = Object.keys(query).reduce((sum, key: keyof EmailQuery) => {
            return `${sum} ${key}:${query[key]}`
        }, '');

        // Then we'll retrieve all emails
        const response = await this.get('https://www.googleapis.com/gmail/v1/users/me/messages?q=' + q) as ListResponse;
        
        // GUARD: Check if the response is proper
        if (!response.messages) {
            throw new Error('Invalid messages response: ' + JSON.stringify(response));
        }
        
        // Then, we'll gather all the parsed email queries
        const emails = response.messages.map(message => {
            return this.getMessage(message.id);
        });

        // And hand back the result
        return Promise.all(emails);
    }

    /**
     * Retrieve a single message
     * @param messageId The message to be retrieved
     */
    async getMessage(messageId: string): Promise<Email> {
        // Read the response
        const rawResponse = await this.get('https://www.googleapis.com/gmail/v1/users/me/messages/' + messageId + '?format=RAW') as MessageResponse;
        
        // GUARD: Check for valid response
        if (!rawResponse.raw) {
            throw new Error('Invalid message response: ' + JSON.stringify(rawResponse));
        }

        // Convert and return
        const response = Buffer.from(rawResponse.raw, 'base64').toString();
        return simpleParser(response);
    }

    async sendMessage(options: Mail.Options): Promise<void> {
        // Compile the supplied email object
        const mail = await new MailComposer(options).compile().build();

        // Setup the right parameters for chucking it to google
        const params = {
            method: 'POST',
            body: JSON.stringify({
                raw: mail.toString('base64'),
            })
        };

        await this.get('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', params); 
    }

    /**
     * Retrieve the email address for the current user
     */
    async getEmailAddress(): Promise<string> {
        return this.get('https://gmail.googleapis.com/gmail/v1/users/me/profile')
            .then((data: ({ emailAddress: string })) => data.emailAddress);
    }

    /**
     * Send out a GET request to the Gmail API
     * @param url URL of the API endpoint
     * @param init Extra parameters to be sent along with the fetch request
     */
    async get(url: string, init: RequestInit = null): Promise<unknown> {
        // GUARD: Check if a token is present before sending request
        if (!this.tokens) {
            throw new Error('Cant refresh tokens if no tokens are present');
        }

        const options = {
            headers: {
                'Authorization': `Bearer ${this.tokens.access_token}`
            },
            ...init
        };

        return fetch(url, options)
            .then(this.tokenMiddleware(url, options))
            .then(this.errorMiddleware)
            .then(response => response.json());
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
                        'Authorization': `Bearer ${this.tokens.access_token}`
                    },
                });
            }
    
            return response;
        }
    }

    /**
     * Will pick off any responses that result in errors
     */
    async errorMiddleware(response: Response): Promise<Response> {
        if (response.status > 400) {
            const text = await response.text();
            throw new Error(`Error while sending request: ${text}`)
        }

        return response;
    }
}