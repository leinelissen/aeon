import { EventEmitter2 } from 'eventemitter2';
import logger from 'main/lib/logger';
import PersistedMap from 'main/lib/persisted-map';
import store from 'main/store';
import GmailEmailClient from './gmail';
import { ImapClient } from './imap';
import OutlookEmailClient from './outlook';
import { EmailClient, EmailEvents } from './types';

const clients: Map<string, { new(email?: string): EmailClient }> = new Map();
clients.set('gmail', GmailEmailClient);
clients.set('outlook', OutlookEmailClient);
clients.set('imap', ImapClient);

export default class EmailManager extends EventEmitter2 {
    // A set of email addresses that maps to the client that is handling the
    // particular email addresses
    initialisedEmailAddress: PersistedMap<string, string>;

    // A set of the initialised emailaddressses linked to the particular
    // initialised email client
    emailClients: Map<string, EmailClient> = new Map();

    constructor() {
        super({ wildcard: true });

        // Retrieve the initialised emailaddresses that have been stored in the store
        const addresses = store.get('initialised-email-addresses', []) as [string, string][];
        this.initialisedEmailAddress = new PersistedMap(addresses, (map) => {
            store.set('initialised-email-addresses', Array.from(map));
        });

        // Then start up all the clients again with the right emailaddresses
        for (const [address, clientKey] of this.initialisedEmailAddress) {
            const Client = clients.get(clientKey);
            this.emailClients.set(address, new Client(address));
        }
    }

    /**
     * This call creates a new email client instance, which is then free to be
     * assigned to an emailadress entered as part of its initialisation logic.
     */
    async initialiseNewAddress(clientKey: string, ...args: unknown[]): Promise<string> {
        logger.email.info('Initialising new email client: ' + clientKey);
        
        // Retrieve the correct client
        const Client = clients.get(clientKey);

        // GUARD: Check if retrieved client exists
        if (!Client) {
            throw new Error('Could not find email client with name ' + clientKey);
        }

        // Then, initialize the new client
        const client = new Client();
        try {    
            // We initialize imap clients somewhat differently, so we need to split
            // it out
            const emailAddress = clientKey === 'imap'
                ? await(client as ImapClient).initializeImap(
                    args[0] as string,
                    args[1] as string,
                    args[2] as string,
                    args[3] as number,
                    args[4] as boolean | undefined,
                )
                : await client.initialize();

            this.initialisedEmailAddress.set(emailAddress, clientKey);
            this.emailClients.set(emailAddress, client);
    
            // Send out event
            this.emit(EmailEvents.NEW_ACCOUNT);
    
            // Return the emailaddress
            return emailAddress;
        } catch (e) {
            logger.email.error({ message: e });
            throw e;
        }
    }

    /**
     * This call instructs a particularl instantiated email client to
     * self-destruct, after which all the remaining pieces are deleted as well.
     * @param address The email address to be deleted
     */
    deleteAccount(address: string): void {
        logger.email.info('Deleting email account: ' + address);

        // GUARD: Check if the address actually exists
        if (!this.emailClients.has(address)) {
            throw new Error('Email account not found');
        }

        // Delete the account
        this.emailClients.get(address).delete();
        this.emailClients.delete(address);
        this.initialisedEmailAddress.delete(address);

        // Send out event
        this.emit(EmailEvents.ACCOUNT_DELETED);
    }
}