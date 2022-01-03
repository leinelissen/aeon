import { autoUpdater } from 'electron';
import EmailManager from './email-client';
import EmailBridge from './email-client/bridge';
import cliArguments from './lib/cli-args';
import Repository from './lib/repository';
import RepositoryBridge from './lib/repository/bridge';
import ProviderManager from './providers';
import ProviderBridge from './providers/bridge';

function initialise(): void {
    // Initialise the Git repository handler
    const repository = new Repository(cliArguments.repositoryDirectory);
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

    // Check for updates when everything is sort of set.
    // NOTE: This call may fail for a number of reasons (e.g. when the --no-auto-updates 
    // flag is set.). Thus we swallow the error and report it out.
    try {
        autoUpdater.checkForUpdates();
    } catch (e) {
        console.error(e);
    }
}

export default initialise;