import EmailManager from './email-client';
import EmailBridge from './email-client/bridge';
import Repository from './lib/repository';
import RepositoryBridge from './lib/repository/bridge';
import ProviderManager from './providers';
import ProviderBridge from './providers/bridge';

function initialise(): void {
    // Initialise the Git repository handler
    const repository = new Repository();
    // Inject the repository handler into the bridge for communication with the rendered
    new RepositoryBridge(repository);

    // Also set up the email manager and bridge
    const email = new EmailManager();
    new EmailBridge(email);

    // Add an event listener for the repository being ready, so that we don't
    // start any Git action before it is ready.
    repository.addListener('ready', () => {
        // Also initialise the Provider Manager
        const providerManager = new ProviderManager(repository, email);
        // And also inject this into its respective bridge
        new ProviderBridge(providerManager);
    });


}

export default initialise;