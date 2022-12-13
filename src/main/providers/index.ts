import { differenceInDays } from 'date-fns';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter2 } from 'eventemitter2';

import { ProviderFile, 
    ProviderUpdateType, 
    InitOptionalParameters, 
    InitialisedAccount, 
} from './types';
import { Provider, 
    DataRequestProvider, 
    EmailDataRequestProvider, 
    OpenDataRightsProvider, 
    UninstatiatedProvider,
} from './types/Provider';
import {
    AccountCreated,
    DataRequestCompleted,
    DataRequestDispatched,
    ProviderEvents, 
    UpdateComplete,
} from './types/Events';


import PersistedMap from 'main/lib/persisted-map';
import store from 'main/store';
import EmailManager from 'main/email-client';
import Repository from '../lib/repository';
import ProviderBridge from './bridge';

import Facebook from './facebook';
import LinkedIn from './linkedin';
import Spotify from './spotify';
import Instagram from './instagram';
import OpenDataRights from './open-data-rights';
import logger from 'main/lib/logger';
import { repositoryPath } from 'main/lib/constants';

export const providers: Array<UninstatiatedProvider> = [
    Instagram,
    Facebook,
    LinkedIn,
    Spotify,
    OpenDataRights,
];

const mapProviderToKey = providers.reduce<Record<string, UninstatiatedProvider>>((sum, provider) => {
    sum[(provider as unknown as typeof Provider).key] = provider;
    return sum;
}, {});

class ProviderManager extends EventEmitter2 {
    // Refers to the repository obejct
    repository: Repository;

    // The email manager
    email: EmailManager;

    // Whether the manager is initialised
    isInitialised = false;

    // Contains all provider instances
    instances: Map<string, Provider & Partial<DataRequestProvider>> = new Map();

    // Contains the keys of all providers that have been initialised by the user
    accounts: PersistedMap<string, InitialisedAccount>;

    // The last time the data requests were checked 
    lastDataRequestCheck: Date;

    constructor(repository: Repository, email: EmailManager) {
        super({ wildcard: true });

        // Store all instances of other classes
        this.repository = repository;
        this.email = email;

        // Construct the initialised providers from the store
        const retrievedAccounts = store.get('provider-accounts', []) as [string, InitialisedAccount][];
        this.accounts = new PersistedMap(retrievedAccounts, (map) => {
            store.set('provider-accounts', Array.from(map));
        });

        // Then create instances for each provider that is retrieved from the store
        this.accounts.forEach((account, key) => {
            const ProviderClass = mapProviderToKey[account.provider];

            // GUARD: If the provider hinges on email, we must inject the client
            // into the class
            const instance = new ProviderClass(account.windowKey, account.account);
            if (instance instanceof EmailDataRequestProvider) {
                const emailAccount = this.email.emailClients.get(account.account);
                
                if (!emailAccount) {
                    logger.email.error(`Email account (${account.account}) used to initialize a provider is no longer available...`);
                    return;
                }

                instance.setEmailClient(emailAccount);
            } 

            // GUARD: If the provider based on an API, we must inject in into
            // the provider
            if (instance instanceof OpenDataRightsProvider) {
                instance.setUrl(account.url);
            }

            this.instances.set(key, instance);
        });

        // Then we create a timeout function that checks for completed data
        // requests every five minutes. Also immediately commence with queueing
        // the refresher
        setInterval(this.refresh, 300_000);
        this.refresh();

        // Then initialise all classes
        // And after send out a ready event
        this.isInitialised = true;
        this.emit(ProviderEvents.READY);
    }

    /**
     * Update all providers
     */
    updateAll = async (): Promise<void> => {
        // Loop through all registered providers and execute their updates
        await Promise.allSettled(this.instances.map((provider, key) => 
            this.update(key),
        ));
    };

    /**
     * Initialise a new provider account. This will return the unique key for
     * the account that has just been created.
     * @param key 
     */
    initialise = async (provider: string, optional: InitOptionalParameters): Promise<string> => {
        logger.provider.info(`Attempting to initialise a new ${provider} (${optional.accountName})`);
        // Generate a random string that is used to refer to the sessions for
        // this particular account
        const windowKey = crypto.randomBytes(32).toString('hex');

        if (!(provider in mapProviderToKey)) {
            throw new Error('No provider registered with name');
        }

        // Call the respective initialise function
        const instance = new mapProviderToKey[provider](windowKey, optional.accountName);

        // GUARD: If we are dealing with a provider that implements email, we
        // must inject an email client into the class
        if (instance instanceof EmailDataRequestProvider) {
            // Retrieve an email client that matches the supplied email address
            const emailAccount = this.email.emailClients.get(optional.accountName);
                
            // GUARD: The address must actually exist
            if (!optional.accountName || !emailAccount) {
                throw new Error('Could not find email client withs suppled account name...');
            }

            // Inject the client into the provider
            instance.setEmailClient(emailAccount);
        }

        // GUARD: If we are dealing with a provider that implements the Open
        // Data Rights API, we must inject the URL into the provider
        if (instance instanceof OpenDataRightsProvider) {
            // Attempt to parse the URL. If it's not a valid URL, this
            // should throw.
            new URL(optional.apiUrl);
            // Then set the URL with trailing slashes removed
            instance.setUrl(optional.apiUrl.replace(/\/+$/, ''));
        }

        // Then initialise the provider
        const account = await instance.initialise();

        // GUARD: Check if the instance has correctly returned an account name
        if (!account) {
            throw new Error('Initialising provider did not return account name');
        }

        const hostname = optional.apiUrl
            ? new URL(optional.apiUrl).host
            : undefined;

        // Save the key to the accounts array
        const key = optional.apiUrl
            ? `${provider}_${hostname}_${account}`
            : `${provider}_${account}`;

        // Construct the details for the provider
        const newAccount: InitialisedAccount = {
            account,
            provider,
            windowKey,
            url: optional.apiUrl && optional.apiUrl.replace(/\/+$/, ''),
            hostname,
            status: {},
        };

        // Save the instance as well
        this.accounts.set(key, newAccount);
        this.instances.set(key, instance);

        // Emit event
        this.emit(ProviderEvents.ACCOUNT_CREATED, newAccount as AccountCreated);

        return key;
    };

    /**
     * Update a single service, either by key (ie `instagram`) or index
     */
    update = async (key: string): Promise<void> => {
        // Retrieve the instance based on whether the supplied argument is an
        // index or class key
        const instance = this.instances.get(key);

        // GUARD: Check if we've found an instance
        if (!instance) {
            throw new Error('NotFoundError');
        }

        // GUARD: Check if the provider is already initialised
        if (!this.accounts.has(key)) {
            throw new Error('ProviderWasNotInitialised');
        }

        // Execute individual update, which should return a list of files to
        // be saved to disk
        const files = await instance.update();

        // GUARD: If the functino returns false, the provider does not implement
        // an update flow, and we end the function
        if (files === false) {
            return;
        }

        // Alternatively, we save the files and attempt to commit
        const commit = await this.saveFilesAndCommit(
            files,
            key,
            `Auto-update ${new Date().toLocaleString()}`,
            ProviderUpdateType.UPDATE,
        );
        
        // GUARD: Only log stuff if new data is found
        if (commit.changedFiles) {
            const event: UpdateComplete = {
                ...this.accounts.get(key),
                ...commit,
            };
            this.emit(ProviderEvents.UPDATE_COMPLETE, event);
        }
    };

    /**
     * Save a bunch of files and auto-commit the result
     */
    saveFilesAndCommit = async (
        files: ProviderFile[],
        key: string, 
        message: string,
        updateType: ProviderUpdateType,
    ): Promise<{ changedFiles: number; commitHash: string; }> => {
        const account = this.accounts.get(key);
        logger.provider.info(`Saving and committing files for ${account.account} [${account.provider}]...`);

        // Then store all files using the repositor save and add handler
        await Promise.all(files.map(async (file: ProviderFile): Promise<void> => {
            // Prepend the supplied path with the key from the specific service
            const location = account.hostname
                ? `${account.provider}/${account.hostname}/${account.account}/${file.filepath}`
                : `${account.provider}/${account.account}/${file.filepath}`;

            // Save the files to disk, and add the files
            if (file.data) {
                await this.repository.save(location, file.data);
            }
            await this.repository.add(location);
        })).catch(console.error);

        // Retrieve repository status and check if any files have actually changed
        const status = await this.repository.status();

        // GUARD: We must check if the changed files have been added to the
        // index, as they will not be part of a commit when it is made.
        const changedFiles = status.filter((file) => file.inIndex());
        logger.provider.info('Files changed: ' + JSON.stringify(changedFiles));

        // GUARD: If no files have changed, it is no longer neccessary to create
        // a new commit.
        if (!changedFiles.length) {
            logger.provider.info('No files have changed since last data request, skipping commit.');
            return;
        }

        // Gather the set of data that is to be appended to the commit
        const messageData: Record<string, string> = {
            'Aeon-Provider': account.provider,
            'Aeon-Account': account.account,
            'Aeon-Update-Type': updateType,
        };

        // Also add optional parameters
        if (account.url && account.hostname) {
            messageData['Aeon-Provider-Hostname'] = account.hostname;
            messageData['Aeon-Provider-URL'] = account.url;
        }

        // Parse the object as a series of "key: value \n" statements
        const augmentedMessage = Object.keys(messageData).reduce((sum, k) => {
            return `${sum}\n${k}: ${messageData[k]}`;
        }, message);

        // Acutally create the commit
        logger.provider.info('Creating commit: ' + message);
        const commit = await this.repository.commit(augmentedMessage);

        return {
            changedFiles: changedFiles.length,
            commitHash: commit,
        };
    };

    /**
     * Do a data request for a single instance
     */
    dispatchDataRequest = async (key: string): Promise<void> => {
        // Retrieve the instance based on whether the supplied argument is an
        // index or class key
        const instance = this.instances.get(key);
        const account = this.accounts.get(key);

        // GUARD: Check if we've found an instance
        if (!instance) {
            throw new Error('NotFoundError');
        }

        // GUARD: Check if the provider is already initialised
        if (!this.accounts.has(key)) {
            throw new Error('ProviderWasNotInitialised');
        }

        // GUARD: Check if the instance supports data request dispatching
        if (!(instance instanceof DataRequestProvider)) {
            throw new Error('DataRequestNotSupportedError');
        }

        // GUARD: Check if a data request hasn't already been dispatched
        if (account.status.dispatched && !account.status.completed) {
            throw new Error('DataRequestAlreadyInProgress');
        }

        // Dispatch the request and wait for it to complete
        const requestId = await instance.dispatchDataRequest();

        // Then store the update time
        account.status = {};
        account.status.dispatched = new Date().toString();
        if (requestId) account.status.requestId = requestId;
        this.accounts.set(key, account);

        this.emit(ProviderEvents.DATA_REQUEST_DISPATCHED, account as DataRequestDispatched);
        logger.provider.info('Dispatched data request for ' + key);
    };

    /**
     * Dispatch data requests for all instances that support it
     */
    dispatchDataRequestToAll = async (): Promise<void> => {
        await Promise.allSettled(this.instances.map((instance, key) =>
            this.dispatchDataRequest(key),
        ));
    };

    refresh = async (): Promise<void> => {
        // Send out an event so the front-end knows we are busy checking
        // outstanding data requests
        ProviderBridge.send(ProviderEvents.CHECKING_DATA_REQUESTS);
        logger.provider.info('Checking for completed data requests...');

        const dataRequests = Promise.all(this.accounts.map(async (account, key): Promise<void> => {
            const instance = this.instances.get(key);

            // GUARD: If we cannot find an instance for this provider type, we
            // skip it
            if (!instance) {
                return;
            }

            // GUARD: If there is not active request for this account, we don't
            // need to force it
            if (!account.status.dispatched) {
                return;
            }

            // GUARD: If a request has already been completed, we do not need to
            // check upon it further
            if (account.status.completed) {
                // However, we will check if we need to purge it from the map if
                // it has been completed for x days
                const ProviderClass: typeof DataRequestProvider = Object.getPrototypeOf(instance).constructor;
                if (differenceInDays(new Date(), new Date(account.status.completed)) > ProviderClass.dataRequestIntervalDays) {
                    logger.provider.info(`Data request for ${key} was completed long enough to be purged`);
                    account.status = {};
                    this.accounts.set(key, account);
                } 
                    
                return;
            }

            // If it is uncompleted, we need to check upon it
            if (await instance.isDataRequestComplete(account.status.requestId).catch(logger.provider.error)) {
                logger.provider.info('A data request has completed! Starting to parse...');

                // If it is complete now, we'll fetch the data and parse it
                const dirPath = account.url && account.hostname
                    ? path.join(repositoryPath, account.provider, account.hostname,  account.account)
                    : path.join(repositoryPath, account.provider, account.account);
                const files = await instance.parseDataRequest(dirPath, account.status.requestId);
                const commit = await this.saveFilesAndCommit(
                    files,
                    key,
                    `Data Request [${key}] ${new Date().toLocaleString()}`,
                    ProviderUpdateType.DATA_REQUEST,
                );
                
                // Set the flag for completion
                account.status.lastCheck = new Date().toString();
                account.status.completed = new Date().toString();
                this.accounts.set(key, account);

                // Emit an event for completion
                const event: DataRequestCompleted = {
                    ...account,
                    ...commit,
                };
                this.emit(ProviderEvents.DATA_REQUEST_COMPLETED, event);

                return;
            }

            account.status.lastCheck = new Date().toString();
            this.accounts.set(key, account);
        }));

        // Also dispatch regular update requests
        await(Promise.allSettled([dataRequests, await this.updateAll()]));
        this.lastDataRequestCheck = new Date();
        logger.provider.info('Check completed.');
    };

}

export default ProviderManager;
