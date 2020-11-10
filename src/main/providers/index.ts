import { EventEmitter } from 'events';
import { differenceInDays } from 'date-fns';
import Instagram from './instagram';
import { Provider, ProviderFile, DataRequestProvider, DataRequestStatus, ProviderEvents, ProviderUpdateType } from './types';
import Repository, { REPOSITORY_PATH } from '../lib/repository';
import Notifications from 'main/lib/notifications';
import ProviderBridge from './bridge';
import PersistedMap from 'main/lib/persisted-map';
import store from 'main/store';
import path from 'path';
import Facebook from './facebook';
import LinkedIn from './linkedin';
import EmailManager from 'main/email-client';

const providers: Array<typeof Provider | typeof DataRequestProvider> = [
    Instagram,
    Facebook,
    LinkedIn,
];

class ProviderManager extends EventEmitter {
    // Refers to the repository obejct
    repository: Repository;
    // The email manager
    email: EmailManager;

    // Whether the manager is initialised
    isInitialised = false;

    // Contains all provider instances
    instances: Map<string, Provider & Partial<DataRequestProvider>> = new Map();

    // Contains the keys of all providers that have been initialised by the user
    initialisedProviders: string[];

    // Stores data requests that have been dispatched, so that we can check upon
    // their state once in a while.
    dispatchedDataRequests: PersistedMap<string, DataRequestStatus>;

    // The last time the data requests were checked 
    lastDataRequestCheck: Date;

    constructor(repository: Repository, email: EmailManager) {
        super();

        // Store all instances of other classes
        this.repository = repository;
        this.email = email;

        // Construct all providers that have been defined at the top
        providers.forEach((SingleProvider): void => {
            this.instances.set(SingleProvider.key, new SingleProvider());
        });

        // Construct the dispatchedDataRequests file so that we can save it to
        // disk whenever neccessary
        const retrievedRequests = store.get('dispatched-data-requests', []) as [string, DataRequestStatus][];
        this.dispatchedDataRequests = new PersistedMap(retrievedRequests, (map) => {
            store.set('dispatched-data-requests', Array.from(map));
        });

        // Construct the initialised providers from the store
        const retrievedProviders = store.get('initialised-providers', []) as string[];
        this.initialisedProviders = retrievedProviders;

        // Then we create a timeout function that checks for completed data
        // requests every five minutes. Also immediately commence with queueing
        // the refresher
        setInterval(this.refresh, 300_000);
        this.refresh();

        // Then initialise all classes
        // And after send out a ready event
        this.isInitialised = true;
        this.emit('ready');
    }

    /**
     * Update all providers
     */
    updateAll = async (): Promise<void> => {
        // Loop through all registered providers and execute their updates
        await Promise.allSettled(this.instances.map((provider, key) => 
            this.update(key)
        ));
    }

    initialise = async (key: string): Promise<boolean> => {
        // Call the respective initialise function
        const success = await this.instances.get(key)?.initialise();

        // If the initialisation was a success, we save this, so that we can act
        // on it later.
        if (success) {
            // Save the key to the array
            this.initialisedProviders = [...this.initialisedProviders, key];
            // And also save the array to the store
            store.set('initialised-providers', this.initialisedProviders);
        }

        return success;
    }

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
        if (!this.initialisedProviders.includes(key)) {
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
        const changedFiles = await this.saveFilesAndCommit(files, key, `Auto-update ${new Date().toLocaleString()}`, ProviderUpdateType.UPDATE);
        
        // GUARD: Only log stuff if new data is found
        if (changedFiles) {
            console.log('Completed update for ', key);
            Notifications.success(`The update for ${key} was successfully completed. ${changedFiles} files were changed.`)
        }
    }

    /**
     * Save a bunch of files and auto-commit the result
     */
    saveFilesAndCommit = async (
        files: ProviderFile[],
        key: string, 
        message: string,
        updateType: ProviderUpdateType
    ): Promise<number> => {
        console.log(`Saving and committing files for ${key}...`);

        // Then store all files using the repositor save and add handler
        await Promise.all(files.map(async (file: ProviderFile): Promise<void> => {
            // Prepend the supplied path with the key from the spcific service
            const location = `${key}/${file.filepath}`;

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
        console.log('Files changed: ', changedFiles);

        // GUARD: If no files have changed, it is no longer neccessary to create
        // a new commit.
        if (!changedFiles.length) {
            console.log('No files have changed since last data request, skipping commit.')
            return;
        }

        // Gather the set of data that is to be appended to the commit
        const messageData: Record<string, string> = {
            'Aeon-Provider': key,
            'Aeon-Update-Type': updateType,
        }

        // Parse the object as a series of "key: value \n" statements
        const augmentedMessage = Object.keys(messageData).reduce((sum, key) => {
            return `${sum}\n${key}: ${messageData[key]}`
        }, message);

        // Acutally create the commit
        console.log('Creating commit: ', message);
        await this.repository.commit(augmentedMessage);

        return changedFiles.length;
    }

    /**
     * Do a data request for a single instance
     */
    dispatchDataRequest = async (key: string): Promise<void> => {
        // Retrieve the instance based on whether the supplied argument is an
        // index or class key
        const instance = this.instances.get(key);

        // GUARD: Check if we've found an instance
        if (!instance) {
            throw new Error('NotFoundError');
        }

        // GUARD: Check if the provider is already initialised
        if (!this.initialisedProviders.includes(key)) {
            // throw new Error('ProviderWasNotInitialised');
            await this.initialise(key);
        }

        // GUARD: Check if the instance supports data request dispatching
        if (!(instance instanceof DataRequestProvider)) {
            throw new Error('DataRequestNotSupportedError');
        }

        // GUARD: Check if a data request hasn't already been dispatched
        if (this.dispatchedDataRequests.has(key)) {
            throw new Error('DataRequestAlreadyInProgress');
        }

        // Dispatch the request and wait for it to complete
        await instance.dispatchDataRequest();

        // Then store the update time
        this.dispatchedDataRequests.set(key, { dispatched: new Date().toString() });

        ProviderBridge.send(ProviderEvents.DATA_REQUEST_DISPATCHED);
        console.log('Dispatched data request for ', key);
    }

    /**
     * Dispatch data requests for all instances that support it
     */
    dispatchDataRequestToAll = async (): Promise<void> => {
        await Promise.allSettled(this.instances.map((instance, key) =>
            this.dispatchDataRequest(key)
        ));
    }

    refresh = async (): Promise<void> => {
        // Send out an event so the front-end knows we are busy checking
        // outstanding data requests
        ProviderBridge.send(ProviderEvents.CHECKING_DATA_REQUESTS);
        console.log('Checking for completed data requests...');

        const dataRequests = Promise.all(this.dispatchedDataRequests.map(async (status, key): Promise<void> => {
            const instance = this.instances.get(key);

            // GUARD: If we cannot find an instance for this provider type, we
            // skip it
            if (!instance) {
                return;
            }

            // GUARD: If a request has already been completed, we do not need to
            // check upon it further
            if (status.completed) {
                // However, we will check if we need to purge it from the map if
                // it has been completed for x days
                const ProviderClass: typeof DataRequestProvider = Object.getPrototypeOf(instance).constructor;
                if (differenceInDays(new Date(), new Date(status.completed)) > ProviderClass.dataRequestIntervalDays) {
                    console.log(`Data request for ${key} was completed long enough to be purged`);
                    this.dispatchedDataRequests.delete(key);
                } 
                    
                return;
            }

            // If it is uncompleted, we need to check upon it
            if (await instance.isDataRequestComplete().catch(() => false)) {
                console.log('A data request has completed! Starting to parse...')

                // If it is complete now, we'll fetch the data and parse it
                const dirPath = path.join(REPOSITORY_PATH, key);
                const files = await instance.parseDataRequest(dirPath);
                const changedFiles = await this.saveFilesAndCommit(files, key, `Data Request [${key}] ${new Date().toLocaleString()}`, ProviderUpdateType.DATA_REQUEST);
                Notifications.success(`The data request for ${key} was successfully completed. ${changedFiles} files were changed.`);
                
                // Set the flag for completion
                this.dispatchedDataRequests.set(key, { 
                    ...status, 
                    lastCheck: new Date().toString(), 
                    completed: new Date().toString() 
                });
                ProviderBridge.send(ProviderEvents.DATA_REQUEST_COMPLETED);

                return;
            }

            this.dispatchedDataRequests.set(key, {
                ...status,
                lastCheck: new Date().toString(),
            });
        }));

        // Also dispatch regular update requests
        await(Promise.allSettled([dataRequests, await this.updateAll()]));

        ProviderBridge.send(ProviderEvents.DATA_REQUEST_COMPLETED);
        this.lastDataRequestCheck = new Date();
        console.log('Check completed.')
    }

}

export default ProviderManager;
