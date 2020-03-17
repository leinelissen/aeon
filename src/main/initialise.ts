import Repository from './lib/repository';
import RepositoryBridge from './lib/repository/bridge';
import ParserCoordinator from './parser';

function initialise(): void {
    // Initialise the Git repository handler
    const repository = new Repository();
    
    // Inject the repository handler into the bridge for communication with the rendered
    new RepositoryBridge(repository);
    new ParserCoordinator(repository).updateAll();
}

export default initialise;