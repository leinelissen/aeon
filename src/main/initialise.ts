import Repository from './lib/repository';
import RepositoryBridge from './lib/repository/bridge';
import ServiceManager from './services';
import ServiceBridge from './services/bridge';

function initialise(): void {
    // Initialise the Git repository handler
    const repository = new Repository();
    // Inject the repository handler into the bridge for communication with the rendered
    new RepositoryBridge(repository);

    // Also initialise the Service Manager
    const serviceManager = new ServiceManager(repository);
    // And also inject this into its respective bridge
    new ServiceBridge(serviceManager);
}

export default initialise;