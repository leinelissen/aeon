import path from 'path';
import { app } from 'electron';
import { EventEmitter } from 'events';
import git, { Errors, ReadCommitResult, TREE, Walker, StatusRow } from 'isomorphic-git';
import { DiffResult, RepositoryEvents } from './types';
import fs from 'fs';
import diffMapFunction from './utilities/diff-map';
import generateParsedCommit from './utilities/generate-parsed-commit';
import { ProviderDatum } from 'main/providers/types';
import RepositoryBridge from './bridge';

// Define a location where the repository will be saved
// TODO: Encrypt this filesystem
export const APP_DATA_PATH = process.env.NODE_ENV === 'production' ? app.getPath('userData') : app.getAppPath();
export const REPOSITORY_PATH = path.resolve(APP_DATA_PATH, 'data', 'repository');
export const EMPTY_REPO_HASH = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

const ENABLE_ENCRYPTION = process.env.ENABLE_ENCRYPTION !== 'false';

class Repository extends EventEmitter {
    /**
     * The default config arguments for isomorphic-git
     */
    config = {
        fs: fs,
        dir: REPOSITORY_PATH,
    }

    /**
     * Whether the git repository is ready for querying
     */
    isInitialised = false;

    /**
     * The default author for all commits made
     */
    author = {
        name: 'Aeon',
        email: 'aeon@codified.nl',
    }

    constructor() {
        super();

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
            .then(() => this.isInitialised = true)
            .then(() => this.emit('ready'))
            .then(console.log)
            .catch(console.error);
    }

    /**
     * Initialise a repository if one doesn't exist already. Also add a base
     * files and commit, so that we can work from there.
     */
    private async initialiseRepository(): Promise<ReadCommitResult | ReadCommitResult[]> {
        console.log('Repository was not found, creating a new one');

        // First we'll initiate the repository
        await git.init(this.config)

        // Then we'll write a file to disk so that the repository is populated
        const readmePath = 'README.md';
        await fs.promises.writeFile(path.resolve(REPOSITORY_PATH, readmePath), Buffer.from('# Aeon Repository', 'utf8'));

        // And create a first commit with the file
        await git.add({ ...this.config, filepath: readmePath });
        await git.commit({ ...this.config, author: this.author, message: 'Initial commit' })
        
        console.log('Initiated new repository at ', REPOSITORY_PATH);

        // Then we return the commit log
        return git.log(this.config);
    }

    /**
     * Generate a complete repository diff for two supplied trees
     * @param refTree The reference tree. Defaults to HEAD
     * @param comparedTree The tree the reference is compared to. Defaults to
     * the previous commit.
     */
    public async diff(
        refTree: string | Walker = 'HEAD', 
        comparedTree: string | Walker = '',
        options: { showUnchangedFiles?: boolean } = {}
    ): Promise<DiffResult<unknown>[]> {
        let previousTree;

        // First we define the trees we want to traverse. The defaults are to
        // look at HEAD, and compare it to the previous commit. Both defaults
        // can be overwritten.
        if (comparedTree === '') {
            // Retrieve the Git log so that we can locate the r
            const log = await git.log(this.config);

            if (refTree === 'HEAD') {
                // If we're at HEAD, the previous commit is the last one
                previousTree = typeof log[1] !== 'undefined' ? log[1].oid : EMPTY_REPO_HASH;
            } else {
                // If we're not, we need to find where the specified commit sits
                // in the log.
                const currentIndex = log.findIndex(obj => obj.oid === refTree);

                // As soon as we know, we can find the previous commit by adding
                // one to the index. If the index doesn't exist, we default to
                // comparing to an empty repo.
                previousTree = typeof log[currentIndex + 1] !== 'undefined' 
                    ? log[currentIndex + 1].oid 
                    : EMPTY_REPO_HASH;
            }
        }

        // Now that all trees are setup, we pour it into the walk function
        const trees = [
            typeof refTree === 'string' ? TREE({ ref: refTree }) : refTree,
            typeof comparedTree === 'string' ? TREE({ ref: comparedTree || previousTree }) : comparedTree
        ];
        
        // Calculate diff
        const diff: DiffResult<unknown>[] = await git.walk({ ...this.config, trees, map: diffMapFunction });

        // Optionally remove all files from the diff without changes
        if (!options.showUnchangedFiles) {
            // Loop through all files one-by-one
            return diff.filter(file => file.hasChanges);
        }

        return diff;
    }

    /**
     * Save a file to disk
     * @param filepath The path to the file relative to the repository root
     * @param data The data that needs to be written to disk
     */
    public async save(filepath: string, data: string | Buffer): Promise<void> {
        const absolutePath = path.resolve(REPOSITORY_PATH, filepath);
        const dirPath = path.dirname(absolutePath);

        // Check if the directory already exists
        if (!fs.existsSync(dirPath)) {
            // If not, create the full path
            await fs.promises.mkdir(dirPath, { recursive: true });
        }

        // Write file to disk
        await fs.promises.writeFile(absolutePath, data);
    }

    /**
     * Generate a fully parsed tree
     */
    public async getParsedCommit(tree = TREE({ ref: 'HEAD' })): Promise<ProviderDatum<unknown, unknown>[]> {
        const data = await git.walk({ 
            ...this.config,
            trees: [tree],
            map: generateParsedCommit,
        }) as ProviderDatum<unknown, unknown>[][];

        return data.flat().sort((a: ProviderDatum<unknown>, b: ProviderDatum<unknown>): number => {
            return a.type.localeCompare(b.type);
        });
    }

    /** 
     * Expose a number of Git functions directly
    */
    public add = (filepath: string, args: { [key: string]: any } = {}): Promise<void> => git.add({ ...this.config, filepath, ...args });
    
    public log = (args: { [key: string]: any } = {}): Promise<ReadCommitResult[]> => git.log({ ...this.config, ...args });
    
    public commit = async (message: string, args: { [key: string]: any } = {}): Promise<string> => {
        const result = await git.commit({ ...this.config, author: this.author, message, ...args });
        RepositoryBridge.send(RepositoryEvents.NEW_COMMIT);
        return result;
    }

    public status = (args: { [key: string]: any } = {}): Promise<StatusRow[]> => git.statusMatrix({ ...this.config, ...args });
    
    public readFile = (filePath: string): Promise<Buffer> => fs.promises.readFile(filePath);
}

export default Repository;