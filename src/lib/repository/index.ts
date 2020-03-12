import fs from 'fs';
import path from 'path';
import { diffLines } from 'diff';
import { app } from 'electron';
import { EventEmitter } from 'events';
import git, { CallbackFsClient, Errors, ReadCommitResult, TREE, WalkerEntry } from 'isomorphic-git';
import { DiffResult } from './types';

// Define a location where the repository will be saved
// TODO: Encrypt this filesystem
export const REPOSITORY_PATH = path.resolve(app.getAppPath(), 'data', 'repository');
export const EMPTY_REPO_HASH = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

const utfDecoder = new TextDecoder('utf-8');

/**
 * The map function that loops through a repository and returns a diff
 * @param filepath The filepath for the currently handled file
 * @param entries The references to the walker functions for the individual trees
 */
const diffMapFunction = async function(filepath: string, entries: Array<WalkerEntry>): Promise<DiffResult> {
    // Extract entries and file contents
    const [ refTree, comparedTree ] = entries;
    const [ oid, refTreeContents, comparedTreeContents ] = await Promise.all([
        refTree.oid(),
        refTree ? refTree.content() : null,
        comparedTree ? comparedTree.content() : null,
    ]);
    
    // Calculate the diff
    const diff = diffLines(comparedTreeContents ? utfDecoder.decode(comparedTreeContents) : '', refTreeContents ? utfDecoder.decode(refTreeContents) : '');

    // Filter any instances where there are no changes
    if (diff.length === 1 && diff[0].count === 0) {
        return;
    }

    // Then return the data as expected
    return { filepath, oid, diff };
}

class Repository extends EventEmitter {
    /**
     * The default config arguments for isomorphic-git
     */
    config = {
        fs: fs.promises as CallbackFsClient,
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
            .catch(console.error);
    }

    /**
     * Initialise a repository if one doesn't exist already. Also add a base
     * files and commit, so that we can work from there.
     */
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

    /**
     * Generate a complete repository diff for two supplied trees
     * @param refTree The reference tree. Defaults to HEAD
     * @param comparedTree The tree the reference is compared to. Defaults to
     * the previous commit.
     */
    public async diff(refTree = 'HEAD', comparedTree?: string): Promise<DiffResult[]> {
        let previousTree;

        // First we define the trees we want to traverse. The defaults are to
        // look at HEAD, and compare it to the previous commit. Both defaults
        // can be overwritten.
        if (!comparedTree) {
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
        const trees = [TREE({ ref: refTree }), TREE({ ref: comparedTree || previousTree })]
        return git.walk({ ...this.config, trees, map: diffMapFunction });
    }

    /**
     * Expose the log function
     */
    public log = (): Promise<ReadCommitResult[]> => git.log(this.config);
}

export default Repository;