import Instagram from './instagram';
import { Provider, ProviderFile } from './types';
import Repository from '../lib/repository';
import path from 'path';
import { EventEmitter } from 'events';

const providers = [
    Instagram
];

class ProviderManager extends EventEmitter {
    instances: Provider[] = [];
    repository: Repository;
    isInitialised = false;

    constructor(repository: Repository) {
        super();

        // Store the repository in this class
        this.repository = repository;

        // Construct all providers that have been defined at the top
        this.instances = providers.map(Provider => new Provider());

        // Then initialise all classes
        // And after send out a ready event
        Promise.all(this.instances.map((instance) => 
            instance.initialise ? instance.initialise() : Promise.resolve()
        )).then(() => this.isInitialised = true)
            .then(() => this.emit('ready'));
    }

    /**
     * Update all providers
     */
    updateAll = async (): Promise<void> => {
        // Loop through all registered providers and execute their updates
        await Promise.all(this.instances.map(async (instance, index) => {
            return this.update(index);
        }));

        // TODO: We can create a commit now!
    }

    /**
     * Update a single service, either by key (ie `instagram`) or index
     */
    update = async (key: string | number): Promise<void> => {
        // Retrieve the instance based on whether the supplied argument is an
        // index or class key
        const instance = typeof key === 'string'
            ? this.instances.find(instance => instance.key === key)
            : this.instances[key];

        // GUARD: Check if we've found an instance
        if (!instance) {
            throw new Error('NotFoundError');
        }

        // Execute individual update, which should return a list of files to
        // be saved to disk
        const files = await instance.update();

        // Then store all files using the repositor save and add handler
        await Promise.all(files.map(async (file: ProviderFile): Promise<void> => {
            // Prepend the supplied path with the key from the spcific service
            const location = path.join(instance.key, file.filepath);

            // Save the files to disk, and add the files
            await this.repository.save(location, file.data);
            await this.repository.add(location);
        }));

        // Check if any files have been added
        const status = await this.repository.status();
        const hasChangedFiles = status.find(
            ([file, HeadStatus, WorkdirStatus, StageStatus]) => WorkdirStatus !== 1 && StageStatus > 1
        );

        if (hasChangedFiles) {
            await this.repository.commit(`Auto-update ${new Date().toLocaleString()}`);
        }
    }
}

export default ProviderManager;
