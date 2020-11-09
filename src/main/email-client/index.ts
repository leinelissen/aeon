import { EventEmitter2 } from 'eventemitter2';
import PersistedMap from 'main/lib/persisted-map';
import store from 'main/store';
import GmailEmailClient from './gmail';
import { EmailClient, EmailEvents } from './types';

const clients = new Map([
    ['gmail', GmailEmailClient]
]);

export default class EmailManager extends EventEmitter2 {
    // A set of email addresses that maps to the client that is handling the
    // particular email addresses
    initialisedEmailAddress: PersistedMap<string, string>;

    // A set of the initialised emailaddressses linked to the particular
    // initialised email client
    emailClients: Map<string, EmailClient> = new Map();

    constructor() {
        super();

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
    async initialiseNewAddress(clientKey: string): Promise<string> {
        console.log('Initialising new email client: ', clientKey);
        
        // Retrieve the correct client
        const Client = clients.get(clientKey);

        // GUARD: Check if retrieved client exists
        if (!Client) {
            throw new Error('Could not find email client with name ' + clientKey);
        }

        // Then, initialize the new client
        const client = new Client();
        const emailAddress = await client.initialize();
        this.initialisedEmailAddress.set(clientKey, emailAddress);
        this.emailClients.set(emailAddress, client);

        // Send out event
        this.emit(EmailEvents.NEW_ACCOUNT);

        // Return the emailaddress
        return emailAddress;
    }

    deleteAccount(address: string): void {
        // GUARD: Check if the address actually exists
        if (this.emailClients.has(address)) {
            throw new Error('Email account now found')
        }

        // Delete the account
        this.emailClients.get(address).delete();

        // Send out event
        this.emit(EmailEvents.ACCOUNT_DELETED);
    }
}