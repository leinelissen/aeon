import PersistedMap from 'main/lib/persisted-map';
import store from 'main/store';
import GmailEmailClient from './gmail';
import { EmailClient } from './types';

const clients = new Map([
    ['gmail', GmailEmailClient]
]);

export default class EmailManager {
    // A set of email addresses that maps to the client that is handling the
    // particular email addresses
    initialisedEmailAddress: PersistedMap<string, string>;

    // A set of the initialised emailaddressses linked to the particular
    // initialised email client
    emailClients: Map<string, EmailClient> = new Map();

    constructor() {
        // Retrieve the initialised emailaddresses that have been stored in the store
        const addresses = store.get('dispatched-data-requests', []) as [string, string][];
        this.initialisedEmailAddress = new PersistedMap(addresses, (map) => {
            store.set('dispatched-data-requests', Array.from(map));
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

        // Return the emailaddress
        return emailAddress;
    }
}