import { ParsedMail } from 'mailparser';
import store from 'main/store';
import { EmailClient } from '../types';
import authenticateOutlookUser from './oauth';

export default class OutlookEmailClient implements EmailClient {
    isInitialized: boolean;

    tokens: unknown;

    emailAddress?: string;

    constructor(emailAddress: string = null) {
        // GUARD: If an emailaddress has been specified, we should be able to
        // retrieve the tokens from the store. This also means the address has
        // already been initialised, as we know it.
        if (emailAddress) {
            const tokens = store.get(`outlook_${emailAddress}`, null) as unknown | null;
            
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
        const tokens = await authenticateOutlookUser();
        this.tokens = tokens;

        const email = await this.getEmailAddress();
        this.emailAddress = email;

        return email;
    }

    async getEmailAddress(): Promise<string> {
        return '';
    }

    delete(): void {
        store.delete(`outlook_${this.emailAddress}`);
    }

    async findMessages(): Promise<ParsedMail[]> {
        return [];
    }
}