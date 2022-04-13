import store from 'main/store';
import authenticateGmailUser, { refreshGmailTokens } from './oauth';
import { GmailTokenResponse } from './types';
import { Email, EmailClient, EmailQuery } from '../types';
import { simpleParser } from 'mailparser';
import Mail from 'nodemailer/lib/mailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import { OauthAutoRefreshingMiddleware } from 'main/lib/oauth';

interface ListResponse {
    messages: {
        id: string;
    }[]
}

interface MessageResponse {
    raw: string;
}

export default class GmailEmailClient extends OauthAutoRefreshingMiddleware implements EmailClient  {
    tokens: GmailTokenResponse | null;

    isInitialized: boolean;

    emailAddress?: string;

    /**
     * 
     * @param emailAddress 
     */
    constructor(emailAddress: string = null) {
        super();

        // GUARD: If an emailaddress has been specified, we should be able to
        // retrieve the tokens from the store. This also means the address has
        // already been initialised, as we know it.
        if (emailAddress) {
            const tokens = store.get(`gmail_${emailAddress}`, null) as GmailTokenResponse | null;
            
            // GUARD: Double-check that whats coming back from the store is
            // actually a token.
            if (!tokens) {
                throw new Error(`Email address '${emailAddress}' was supposed to be initialised already with the Gmail Client, but no tokens could be retrieved from the store.`);
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
            return `${sum} ${key}:${query[key]}`;
        }, '');

        // Then we'll retrieve all emails
        const response = await this.get('https://www.googleapis.com/gmail/v1/users/me/messages?q=' + q) as ListResponse;
        
        // GUARD: Check if the response is proper
        if (!response.messages) {
            throw new Error('Invalid messages response: ' + JSON.stringify(response));
        }
        
        // Then, we'll gather all the parsed email queries
        const emails = response.messages.map((message) => {
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
            }),
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
}