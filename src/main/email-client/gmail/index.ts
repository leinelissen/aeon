import authenticateGmailUser, { refreshGmailTokens } from './oauth';
import { GmailTokenResponse } from './types';
import { Email, EmailQuery } from '../types';
import { simpleParser } from 'mailparser';
import Mail from 'nodemailer/lib/mailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import { OauthEmailClient } from 'main/lib/oauth';

interface ListResponse {
    messages: {
        id: string;
    }[]
}

interface MessageResponse {
    raw: string;
}

export default class GmailEmailClient extends OauthEmailClient<GmailTokenResponse>  {
    key = 'gmail';

    async initialize(): Promise<string> {
        // Retrieve the tokens
        const tokens = await authenticateGmailUser();
        
        // Retrieve the email address
        await this.storeTokens(tokens, false);
        this.emailAddress = await this.getEmailAddress();

        // Persist the tokens
        await this.storeTokens(tokens);

        return this.emailAddress;
    }

    async refreshTokens(expiredTokens: GmailTokenResponse): Promise<GmailTokenResponse> {
        const tokens = await refreshGmailTokens(expiredTokens.refresh_token);

        return tokens;
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