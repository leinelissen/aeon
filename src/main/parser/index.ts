import Instagram from './instagram';
import { Parser, ParserFile } from './types';
import Repository from '../lib/repository';
import path from 'path';

const parsers = [
    Instagram
];

class ParserCoordinator {
    instances: Parser[] = [];
    repository: Repository;

    constructor(repository: Repository) {
        this.instances = parsers.map(Parser => new Parser());
        this.repository = repository;
        this.instances.forEach((instance) => instance.initialise && instance.initialise());
    }

    /**
     * Update all parsers
     */
    async updateAll(): Promise<void> {
        // Loop through all registered parsers and execute their updates
        await Promise.all(this.instances.map(async (instance) => {
            // Execute individual update, which should return a list of files to
            // be saved to disk
            const files = await instance.update();

            // Then store all files using the repositor save and add handler
            await Promise.all(files.map((file: ParserFile) => {
                // Prepend the supplied path with the key from the spcific parser
                const location = path.join(instance.key, file.filepath);

                return this.repository.saveAndAdd(location, file.data);
            }));
        }));

        // TODO: We can create a commit now!
    }
}

export default ParserCoordinator;
