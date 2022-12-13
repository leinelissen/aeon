import type { ParsedMail } from 'mailparser';
import type { Options } from 'nodemailer/lib/mailer';

export interface EmailQuery {
    from?: string;
    to?: string;
    subject?: string;
    messageId?: string;
    /** UNIX time in seconds after which the message was sent */
    after?: number;
}

export type Email = ParsedMail;

export abstract class EmailClient {
    /**
     * Whether the current client has been initialized or not
     */
    protected isInitialized: boolean;

    /**
     * The emailaddress that this particular client resolves to. Should not be
     * set if the client has not been initialised yet.
     */
    protected emailAddress?: string;

    /**
     * A unique identifier for this type of emailclient. This should be pathname
     * safe, i.e. all lowercase, no spaces.
     */
    protected key: string;

    /**
     * Initialize a new email client. Prepare it for use through either login
     * screens, consent, or whatever. Only called when first setting up the
     * email client. This function returns the emailaddress that has just been
     * successfully initialised.
     */
    abstract initialize(): Promise<string>;

    /**
     * Remove a previously registered and initialized account completely.
     */
    abstract delete(): Promise<void> | void;
    
    /**
     * Retrieve a set of messages using the query object
     * @param query EmailQuery
     */
    abstract findMessages(query?: EmailQuery): Promise<Email[]>;


    constructor(emailAddress: string | null) {
        this.emailAddress = emailAddress;
    }
}

export interface EmailClient {
    /**
     * Send an email with the client, using the specified options
     * @param options Mail.Options
     */
    sendMessage?(options: Options): Promise<void>;
}

export enum EmailCommands {
    ADD_ACCOUNT,
    DELETE_ACCOUNT,
    GET_ACCOUNTS,
    GET_CLIENTS,
    TEST_IMAP,
}

export enum EmailEvents {
    NEW_ACCOUNT = 'new-account',
    ACCOUNT_DELETED = 'account-deleted',
}