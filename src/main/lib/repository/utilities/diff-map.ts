import generateDiff from './generate-diff';
import { DiffResult } from '../types';
import { TreeEntry } from 'nodegit';


/**
 * The map function that loops through a repository and returns a diff
 * @param filepath The filepath for the currently handled file
 * @param entries The references to the walker functions for the individual trees
 */
const diffMapFunction = async function(filepath: string, entries: Array<TreeEntry>): Promise<DiffResult<unknown>> {
    // Extract entries and file contents
    const [ refTree, comparedTree ] = entries;

    // Calculate the diff
    const diff = await generateDiff(filepath, comparedTree, refTree);

    // Filter any instances where there are no changes
    if (!diff || !diff.hasChanges) {
        return;
    }

    // Then return the data as expected
    return diff;
}

export default diffMapFunction;