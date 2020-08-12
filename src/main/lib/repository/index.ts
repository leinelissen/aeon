import path from 'path';
import { app } from 'electron';
import { EventEmitter } from 'events';
import git, { TREE, Walker, StatusRow } from 'isomorphic-git';
import NodeGit from 'nodegit';
import { DiffResult, RepositoryEvents, Commit } from './types';
import CryptoFs from '../crypto-fs';
import nonCryptoFs from 'fs';
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
const fs = ENABLE_ENCRYPTION ? new CryptoFs('password').init() : nonCryptoFs;

class Repository extends EventEmitter {
    /**
     * The default config arguments for isomorphic-git
     */
    config = {
        fs: fs,
        dir: path.join(REPOSITORY_PATH, '.git'),
    }

    /**
     * Whether the git repository is ready for querying
     */
    isInitialised = false;

    /**
     * The default author for all commits made
     */
    author = NodeGit.Signature.now(
        'Aeon',
        'aeon@codified.nl',
    );

    /**
     * A reference to an instance of Nodegit's repository class
     */
    repository: NodeGit.Repository = null;

    constructor() {
        super();

        NodeGit.Repository.open(this.config.dir)
            .catch(e => {
                return this.initialiseRepository();
            })
            .then((repository) => {
                this.repository = repository;
                this.isInitialised= true;
                this.emit('ready');
                console.log('Repository was succesfully initiated at ', REPOSITORY_PATH);
            })
            .catch(console.error);
    }

    /**
     * Initialise a repository if one doesn't exist already. Also add a base
     * files and commit, so that we can work from there.
     */
    private async initialiseRepository(): Promise<NodeGit.Repository> {
        console.log('Repository was not found, creating a new one');

        // First we'll initiate the repository
        // await git.init(this.config)
        const repository = await NodeGit.Repository.init(this.config.dir, 0);

        // Then we'll write a file to disk so that the repository is populated
        const readmePath = 'README.md';
        await fs.promises.writeFile(path.resolve(REPOSITORY_PATH, readmePath), Buffer.from('# Aeon Repository', 'utf8'));

        // And create a first commit with the file
        // await git.add({ ...this.config, filepath: readmePath });
        // await git.commit({ ...this.config, author: this.author, message:
        // 'Initial commit' })
        const index = await repository.refreshIndex();
        await index.addByPath(readmePath);
        await index.write();
        const oid = await index.writeTree();
        await repository.createCommit('HEAD', this.author, this.author, 'Initial Commit', oid, []);
        
        console.log('Initiated new repository at ', REPOSITORY_PATH);

        // Then we return the commit log
        return repository;
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
    public async add(filepath: string): Promise<void> {
        const index = await this.repository.refreshIndex();
        await index.addByPath(filepath);
    }
    
    public async log(): Promise<Commit[]> {
        // Create new revwalk to gather all commits
        const walker = NodeGit.Revwalk.create(this.repository);

        // Start from HEAD and retrieve all commits
        walker.pushHead();
        const commits = await walker.getCommitsUntil(() => true) as NodeGit.Commit[];

        return Promise.all(
            commits.map(async (commit) => {
                const author = commit.author();

                return {
                    oid: commit.sha(),
                    message: commit.message(),
                    author: {
                        email: author.email(),
                        name: author.name(),
                        when: commit.time(),
                    },
                    parents: commit.parents(),
                };
            })
        );
    }
    
    public async commit(message: string): Promise<void> {
        // Retrieve and write new index
        const index = await this.repository.refreshIndex();
        await index.write();
        const oid = await index.writeTree();

        // Create commit using new index
        await this.repository.createCommit('HEAD', this.author, this.author, message, oid, []);

        // Notify app of new commit
        RepositoryBridge.send(RepositoryEvents.NEW_COMMIT);
    }

    public status = (args: { [key: string]: any } = {}): Promise<StatusRow[]> => git.statusMatrix({ ...this.config, ...args });
    
    public readFile = (filePath: string): Promise<Buffer> => fs.promises.readFile(filePath);
}

export default Repository;