import { ParsedMail } from 'mailparser';
import { Options } from 'nodemailer/lib/mailer';

export interface EmailQuery {
    from?: string;
    to?: string;
    subject?: string;
    messageId?: string;
}

export type Email = ParsedMail;

export abstract class EmailClient {
    /**
     * Whether the current client has been initialized or not
     */
    isInitialized: boolean;

    /**
     * Initialize the email client. Prepare it for use through either login
     * screens, consent, or whatever. Only called when first setting up the
     * email client.
     */
    abstract initialize(): Promise<void>
    /**
     * Retrieve a set of messages using the query object
     * @param query EmailQuery
     */
    abstract findMessages(query?: EmailQuery): Promise<Email[]>
    /**
     * Send an email with the client, using the specified options
     * @param options Mail.Options
     */
    abstract sendMessage(options: Options): Promise<void>;
}