import store from 'main/store';
import authenticateGmailUser, { refreshGmailTokens } from './oauth';
import { TokenResponse } from './types';

export default class GmailEmailClient {
    tokens: TokenResponse | null;

    constructor() {
        const tokens = store.get('gmail_tokens', null) as TokenResponse | null;
        this.tokens = tokens;
    }

    async initialize(): Promise<void> {
        // Retrieve the tokens
        const tokens = await authenticateGmailUser();

        // Save the tokens
        this.tokens = tokens;
        store.set('gmail_tokens', tokens);
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
        store.set('gmail_tokens', tokens);
    }

    async findMessages(query: string): Promise<unknown> {
        return this.get('https://www.googleapis.com/gmail/v1/users/me/messages?q=' + query);
    }

    async getMessage(messageId: string): Promise<unknown> {
        return this.get('https://www.googleapis.com/gmail/v1/users/me/messages/' + messageId);
    }

    async get(url: string, init: RequestInit = null): Promise<unknown> {
        // GUARD: Check if a token is present before sending request
        if (!this.tokens) {
            throw new Error('Cant refresh tokens if no tokens are present');
        }

        return fetch(url, {
            headers: {
                Authorization: `Bearer ${this.tokens.access_token}`
            },
            ...init
        });
    }
}