import Repository from './lib/repository';
import RepositoryBridge from './lib/repository/bridge';
import ProviderManager from './providers';
import ProviderBridge from './providers/bridge';
import mountCryptoFS from './lib/crypto-fs';

async function initialise(): Promise<void> {
    // Wait for the encrypted filesystem to be mounted
    await mountCryptoFS();

    // Initialise the Git repository handler
    const repository = new Repository();
    // Inject the repository handler into the bridge for communication with the rendered
    new RepositoryBridge(repository);

    // Also initialise the Provider Manager
    const providerManager = new ProviderManager(repository);
    // And also inject this into its respective bridge
    new ProviderBridge(providerManager);
}

export default initialise;