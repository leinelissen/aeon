import { ParsedMail } from 'mailparser';
import { Options } from 'nodemailer/lib/mailer';

export interface EmailQuery {
    from?: string;
    to?: string;
    subject?: string;
    messageId?: string;
}

export type Email = ParsedMail;

export interface EmailClient {
    /**
     * Whether the current client has been initialized or not
     */
    isInitialized: boolean;

    /**
     * The emailaddress that this particular client resolves to. Should not be
     * set if the client has not been initialised yet.
     */
    emailAddress?: string;

    /**
     * Initialize the email client. Prepare it for use through either login
     * screens, consent, or whatever. Only called when first setting up the
     * email client. This function returns the emailaddress that has just been
     * successfully initialised.
     */
    initialize(): Promise<string>
    
    /**
     * Retrieve a set of messages using the query object
     * @param query EmailQuery
     */
    findMessages(query?: EmailQuery): Promise<Email[]>

    /**
     * Send an email with the client, using the specified options
     * @param options Mail.Options
     */
    sendMessage(options: Options): Promise<void>;
}