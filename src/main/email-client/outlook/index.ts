import { formatISO } from 'date-fns';
import { ParsedMail, simpleParser } from 'mailparser';
import { OauthEmailClient } from 'main/lib/oauth';
import { EmailQuery } from '../types';
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

export default class OutlookEmailClient extends OauthEmailClient<OutlookTokenResponse> {
    key = 'outlook';

    async initialize(): Promise<string> {
        // Retrieve access token from user
        const tokens = await authenticateOutlookUser();
        
        // Retrieve and store email address
        await this.storeTokens(tokens, false);
        const email = await this.getEmailAddress();
        this.emailAddress = email;
        
        // Persist the tokens
        await this.storeTokens(tokens);

        return email;
    }

    async getEmailAddress(): Promise<string> {
        const response = await this.get('https://graph.microsoft.com/v1.0/me') as ProfileResponse;
        return response.userPrincipalName;
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

    async refreshTokens(expiredTokens: OutlookTokenResponse): Promise<OutlookTokenResponse> {
        return refreshOutlookTokens(expiredTokens);
    }
}