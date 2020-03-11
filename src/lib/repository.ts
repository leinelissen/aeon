import fs from 'fs';
import path from 'path';
import diff from 'diff';
import { app } from 'electron';
import git, { CallbackFsClient, Errors, ReadCommitResult } from 'isomorphic-git';

// Define a location where the repository will be saved
// TODO: Encrypt this filesystem
export const REPOSITORY_PATH = path.resolve(app.getAppPath(), 'data', 'repository');

class Repository {
    config = {
        fs: fs as CallbackFsClient,
        dir: REPOSITORY_PATH,
    }

    isInitialised = false;

    author = {
        name: 'Aeon',
        email: 'aeon@codified.nl',
    }

    constructor() {
        // Attempt to log the repository commits
        git.log(this.config)
            .then((data) => { console.log('Successfully initiated existing repository at ', REPOSITORY_PATH); return data })
            .catch(e => {
                // Catch errors
                if (e instanceof Errors.NotFoundError) {
                    // If the error is a HEAD not found error, the repository is
                    // empty and thus we need to initialise it.
                    return this.initialiseRepository();
                } else {
                    console.error('Unknown error!', e.constructor.name)
                }
            })
            .then(console.log)
            .then(() => this.isInitialised = true)
            .catch(console.error);
    }

    private async initialiseRepository(): Promise<ReadCommitResult | ReadCommitResult[]> {
        // First we'll initiate the repository
        await git.init(this.config)

        // Then we'll write a file to disk so that the repository is populated
        const readmePath = 'README.md';
        await fs.promises.writeFile(path.resolve(REPOSITORY_PATH, readmePath), '# Aeon Repository');

        // And create a first commit with the file
        await git.add({ ...this.config, filepath: readmePath });
        await git.commit({ ...this.config, author: this.author, message: 'Initial commit' })
        
        console.log('Initiated new repository at ', REPOSITORY_PATH);

        // Then we return the commit log
        return git.log(this.config);
    }

    // public diff(ref = 'HEAD'): string[] {
    //     // First we define the trees we want to traverse

    //     git.walk({ ...this.config });
    // }
}

const repository = new Repository();

export default repository;