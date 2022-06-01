import { ImapFlow } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';
import logger from 'main/lib/logger';
import { KeyStore } from 'main/store';
import { EmailClient, EmailQuery } from '../types';

export interface ImapCredentials {
    user: string;
    pass: string;
    host: string;
    port: number;
    secure: boolean;
}

/**
 * Attempt to connect to an IMAP server with a bunch of credentials in order to
 * ascertain whether all the settings are right.
 */
export async function testImap(
    user: string,
    pass: string,
    host: string,
    port: number,
    secure = true,
): Promise<boolean> {
    const client = new ImapFlow({
        host, 
        port, 
        auth: {
            user,
            pass,
        },
        secure,
        logger: logger.email,
    });

    try {
        // Attempt to connect
        await client.connect();
    } catch {
        // If an error is thrown, return false
        return false;
    }

    // If nothing gets thrown, disconnect the client.
    await client.close();

    return true;
}

export class ImapClient extends EmailClient {
    client: ImapFlow | null;

    key = 'imap';

    async initialize(): Promise<string> {
        throw new Error('The IMAP email client should be initialized using the initializeImap function');
    }

    async initializeImap(
        user: string,
        pass: string,
        host: string,
        port: number,
        secure = true,
    ): Promise<string> {
        // Initialize the client
        this.client = new ImapFlow({
            host, 
            port, 
            auth: {
                user,
                pass,
            },
            secure,
            logger: logger.email,
        });

        // Attempt to connect in order to ensure the credentials are correct
        await this.client.connect();        

        // First set the email address
        this.emailAddress = user;
        
        // Persist the credentials
        await KeyStore.set(`${this.key}_${this.emailAddress}`, JSON.stringify({ user, pass, host, port, secure }));
        this.isInitialized = true;

        // Return the emailaddress to the manager
        return user;
    }

    async delete(): Promise<void> {
        // Delete the credentials from the store, and that's that
        await KeyStore.delete(`${this.key}_${this.emailAddress}`);
    }

    async findMessages(query?: EmailQuery): Promise<ParsedMail[]> {
        // GUARD: Check whether the client is already created and connected 
        if (!this.isInitialized) {
            // Retrieve the raw JSON string from the keystore and parse it
            const rawCredentials = await KeyStore.get(`${this.key}_${this.emailAddress}`);
            const { host, port, user, pass, secure } = JSON.parse(rawCredentials) as ImapCredentials;

            // Initialize the client
            this.client = new ImapFlow({
                host, 
                port, 
                auth: {
                    user,
                    pass,
                },
                secure,
                logger: logger.email,
            });

            // Attempt to connect in order to ensure the credentials are correct
            await this.client.connect();   
            this.isInitialized = true;
        }

        // Then try and search for messages
        const generator = await this.client.fetch({
            to: query.to,
            from: query.from,
            subject: query.subject,
            emailId: query.messageId,
            since: query.after && new Date(query.after * 1000),
        }, {
            uid: true,
            source: true,
            headers: true,
        });
        
        // Loop through every available message and parse the body using mailparser
        const messages: ParsedMail[] = [];
        for await (const message of generator) {
            const parsedMessage = await simpleParser(message.source);
            messages.push(parsedMessage);
        }

        return messages;
    }
}
