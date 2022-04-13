import { ParsedMail } from 'mailparser';
import { OauthAutoRefreshingMiddleware } from 'main/lib/oauth';
import store from 'main/store';
import { EmailClient } from '../types';
import authenticateOutlookUser, { OutlookTokenResponse, refreshOutlookTokens } from './oauth';

interface ProfileResponse {
    '@odata.context': string;
    businessPhones: string[];
    displayName: string;
    givenName: string;
    jobTitle: string;
    mail: string;
    mobilePhone?: string;
    officeLocation: string;
    preferredLanguage: string;
    surname: string;
    userPrincipalName: string;
    id: string;
}

export default class OutlookEmailClient extends OauthAutoRefreshingMiddleware implements EmailClient {
    isInitialized: boolean;

    tokens: OutlookTokenResponse;

    emailAddress?: string;

    constructor(emailAddress: string = null) {
        super();

        // GUARD: If an emailaddress has been specified, we should be able to
        // retrieve the tokens from the store. This also means the address has
        // already been initialised, as we know it.
        if (emailAddress) {
            const tokens = store.get(`outlook_${emailAddress}`, null) as OutlookTokenResponse | null;
            
            // GUARD: Double-check that whats coming back from the store is
            // actually a token.
            if (!tokens) {
                throw new Error(`Email address '${emailAddress}' was supposed to be initialised already with the Outlook Client, but no tokens could be retrieved from the store.`);
            }

            this.tokens = tokens;
            this.emailAddress = emailAddress;
        }

        // Then we set the right initialisation flag
        this.isInitialized = !!this.tokens;
    }

    async initialize(): Promise<string> {
        // Retrieve access token from user
        const tokens = await authenticateOutlookUser();
        this.tokens = tokens;
        
        // Retrieve and store email address
        const email = await this.getEmailAddress();
        this.emailAddress = email;

        // Store token in store
        store.set(`outlook_${this.emailAddress}`, tokens);

        return email;
    }

    async getEmailAddress(): Promise<string> {
        const response = await this.get('https://graph.microsoft.com/v1.0/me') as ProfileResponse;
        return response.userPrincipalName;
    }

    delete(): void {
        store.delete(`outlook_${this.emailAddress}`);
    }

    async findMessages(): Promise<ParsedMail[]> {
        return [];
    }

    async refreshTokens() {
        // GUARD: Check if a token has already been retrieved
        if (!this.tokens) {
            throw new Error('Cant refresh tokens if no tokens are present');
        }

        // If so, refresh the token
        const tokens = await refreshOutlookTokens(this.tokens);

        // Save the tokens
        this.tokens = tokens;
        store.set(`gmail_${this.emailAddress}`, tokens);
    }
}