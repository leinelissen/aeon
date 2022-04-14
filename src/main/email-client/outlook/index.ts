import { formatISO } from 'date-fns';
import { ParsedMail, simpleParser } from 'mailparser';
import { OauthAutoRefreshingMiddleware } from 'main/lib/oauth';
import store from 'main/store';
import { EmailClient, EmailQuery } from '../types';
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

    async findMessages(query?: EmailQuery): Promise<ParsedMail[]> {
        // Setup an array storing all potential filters
        const filters: string[] = [];

        // We then make quite the ugly long if-statement converting from the
        // Gmail-format, to the weird filter-format handled by Microsoft Graph
        
        if (query.from) {
            filters.push(`from/emailAddress/address eq '${query.from}'`);
        }

        if (query.to) {
            // This filter is not supported in Microsoft Graph, so we cannot
            // implement it
        }

        if (query.subject) {
            filters.push(`contains(subject, '${query.subject}')`);
        }

        if (query.after) {
            const date = new Date(query.after * 1000);
            filters.push(`receivedDateTime ge ${formatISO(date, { representation: 'date' })}`);
        }

        // Lastly, we convert the filters to a single string using or-chains
        const uri = 'https://graph.microsoft.com/v1.0/me/messages?$select=id&$filter=' + filters.join(' or ');

        // We then send out the request
        const { value: messages } = await this.get(uri) as { value: { id: string }[] };

        return Promise.all(
            messages
                .map((m) => m.id)
                .map(this.getMessage),
        );
    }

    /**
     * Retrieve a single message from Graph
     */
    async getMessage(id: string): Promise<ParsedMail> {
        const uri = `https://graph.microsoft.com/v1.0/me/messages/${id}/$value`;
        const body = await this.get(uri, null, 'text') as string;
        return simpleParser(body);
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