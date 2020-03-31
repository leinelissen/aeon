import path from 'path';
import { EventEmitter } from 'events';
import { differenceInDays } from 'date-fns';
import Store from 'electron-store';
import Instagram from './instagram';
import { Provider, ProviderFile, DataRequestProvider, DataRequestStatus, ProviderEvents } from './types';
import Repository from '../lib/repository';
import Notifications from 'main/lib/notifications';
import ProviderBridge from './bridge';
import PersistedMap from 'main/lib/persisted-map';

const providers: Array<typeof Provider | typeof DataRequestProvider> = [
    Instagram,
];

class ProviderManager extends EventEmitter {
    // Contains all initialised provider instances
    instances: Map<string, Provider & Partial<DataRequestProvider>> = new Map();

    // Refers to the repository obejct
    repository: Repository;

    // Whether the manager is initialised
    isInitialised = false;

    // Stores data requests that have been dispatched, so that we can check upon
    // their state once in a while.
    dispatchedDataRequests: PersistedMap<string, DataRequestStatus>;

    constructor(repository: Repository) {
        super();

        // Store the repository in this class
        this.repository = repository;

        // Construct all providers that have been defined at the top
        providers.forEach((SingleProvider): void => {
            this.instances.set('instagram', new SingleProvider());
        });

        // Construct the dispatchedDataRequests file so that we can save it to
        // disk whenever neccessary
        const store = new Store();
        const retrievedRequests = JSON.parse(store.get('dispatched-data-requests', '[]'));
        this.dispatchedDataRequests = new PersistedMap(retrievedRequests, (map) => {
            store.set('dispatched-data-requests', map.toString());
        });

        // Then we create a timeout function that checks for completed data
        // requests
        // setInterval(this.refreshDataRequests, 60000);

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
        await Promise.all(this.instances.map((key) => 
            this.update(key)
        ));

        // TODO: We can create a commit now!
    }

    initialise = async (key: string): Promise<boolean> => {
        return this.instances.get(key)?.initialise();
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

        // Execute individual update, which should return a list of files to
        // be saved to disk
        const files = await instance.update();
        const changedFiles = await this.saveFilesAndCommit(files, instance.key, `Auto-update ${new Date().toLocaleString()}`);
        Notifications.success(`The update for ${instance.name} was successfully completed. ${changedFiles} files were changed.`)
    }

    /**
     * Save a bunch of files and auto-commit the result
     */
    saveFilesAndCommit = async (files: ProviderFile[], key: string, message: string): Promise<number> => {
        console.log(files);

        // Then store all files using the repositor save and add handler
        await Promise.all(files.map(async (file: ProviderFile): Promise<void> => {
            // Prepend the supplied path with the key from the spcific service
            const location = path.join(key, file.filepath);

            // Save the files to disk, and add the files
            await this.repository.save(location, file.data);
            await this.repository.add(location);
        }));

        // Check if any files have been added
        const status = await this.repository.status();
        const amountOfFilesChanged = status.filter(
            ([, , WorkdirStatus, StageStatus]) => WorkdirStatus !== 1 && StageStatus > 1
        ).length;

        console.log(status, amountOfFilesChanged);

        if (amountOfFilesChanged) {
            await this.repository.commit(message);
        }

        return amountOfFilesChanged;
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

        // GUARD: Check if the instance supports data request dispatching
        if (!(instance instanceof DataRequestProvider)) {
            throw new Error('DataRequestNotSupportedError');
        }

        // GUARD: Check if a data request hasn't already been dispatched
        if (this.dispatchedDataRequests.has(instance.key)) {
            throw new Error('DataRequestAlreadyInProgress');
        }

        // Dispatch the request and wait for it to complete
        await instance.dispatchDataRequest();

        // Then store the update time
        this.dispatchedDataRequests.set(instance.key, { dispatched: new Date() });
    }

    /**
     * Dispatch data requests for all instances that support it
     */
    dispatchDataRequestToAll = async (): Promise<void> => {
        await Promise.all(this.instances.map((instance, key) =>
            this.dispatchDataRequest(key)
                .catch(() => null)
        ));
    }

    refreshDataRequests = async (): Promise<void> => {
        // Send out an event so the front-end knows we are busy checking
        // outstanding data requests
        ProviderBridge.send(ProviderEvents.CHECKING_DATA_REQUESTS);
        console.log('Checking for completed data requests...');

        await Promise.all(this.dispatchedDataRequests.map(async (status, key): Promise<void> => {
            const instance = this.instances.get(key);

            // GUARD: If a request has already been completed, we do not need to
            // check upon it further
            if (status.completed) {
                // However, we will check if we need to purge it from the map if
                // it has been completed for x days
                if (differenceInDays(status.completed, new Date()) > instance.dataRequestIntervalDays) {
                    this.dispatchedDataRequests.delete(key);
                }

                return;
            }

            // If it is uncompleted, we need to check upon it
            if (await instance.isDataRequestComplete()) {
                ProviderBridge.send(ProviderEvents.DATA_REQUEST_COMPLETED);
                console.log('A data request has completed! Starting to parse...')

                // If it is complete now, we'll fetch the data and parse it
                const files = await instance.parseDataRequest();
                const changedFiles = await this.saveFilesAndCommit(files, instance.key, `Data Request [${instance.key}] ${new Date().toLocaleString()}`)
                Notifications.success(`The data request for ${instance.name} was successfully completed. ${changedFiles} files were changed.`)
            }


            this.dispatchedDataRequests.set(key, {
                ...status,
                lastCheck: new Date(),
            });
        }));
    }

}

export default ProviderManager;
