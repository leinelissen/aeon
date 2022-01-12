import { DiffType, DiffResult } from '../types';
import generateParsedCommit from './generate-parsed-commit';
import { ProviderDatum } from 'main/providers/types/Data';
import { isEqual } from 'lodash-es';
import { TreeEntry } from 'nodegit';

interface DataArrayDiff {
    added: ProviderDatum<unknown, unknown>[],
    deleted: ProviderDatum<unknown, unknown>[],
    updated: ProviderDatum<unknown, unknown>[],
}

/**
 * Check which elements from a are not present on elements from b. The right way
 * to look at this is to see which elements were 'added' when going from array
 * to array b.
 * @param a 
 * @param b 
 */
function diffDataArray(
    before: ProviderDatum<unknown, unknown>[], 
    after: ProviderDatum<unknown, unknown>[],
): DataArrayDiff {
    // GUARD: If any of the two diffs is empty, return the whole object as diff
    if (!before.length) {
        // There was nothing before, so everything remains after
        return {
            added: after,
            deleted: [],
            updated: [],
        };
    } else if (!after.length) {
        // Everything existed before, and nothing remains
        return {
            added: [],
            deleted: before,
            updated: [],
        };
    }

    // Initialise sorted arrays
    const added: ProviderDatum<unknown, unknown>[] = [];
    const deleted: ProviderDatum<unknown, unknown>[] = [];
    const updated: ProviderDatum<unknown, unknown>[] = [];

    // TODO: This block is ripe for optimisation. Currently, both arrays are
    // fully looped. If saving matches from the first loop, we can skip the
    // largest part of the second loop. This hould increase performance more
    // than two-fold.

    // Loop through the before array to see if any of its elements have been deleted
    for (const dBefore of before) {
        // Find any object on the after array that matches this datapoint
        const match = after.find((dAfter) => {
            return typeof dAfter.data === 'object' && dAfter.data !== null
                ? isEqual(dBefore.data, dAfter.data)
                : dBefore.data === dAfter.data;
        });

        // If a match is found, we can exit the loop. No change has been made to
        // the datapoint.
        if (match) {
            continue;
        }

        deleted.push(dBefore);
    }

    // Now we'll sort through the after array and see if any elements have been added
    for (const dAfter of after) {
        // Find any object on the after array that matches this datapoint
        const match = before.find((dBefore) => {
            return typeof dAfter.data === 'object' && dAfter.data !== null
                ? isEqual(dAfter.data, dBefore.data)
                : dAfter.data === dBefore.data;
        });

        // If a match is found, we can exit the loop. No change has been made to
        // the datapoint.
        if (match) {
            continue;
        }

        added.push(dAfter);
    }

    return {
        added,
        deleted,
        updated,
    };
}

/**
 * Generates a specific diff according to filetype
 * @param filepath The filepath of the diffed file
 * @param ref The ref Buffer
 * @param compared The compared Buffer
 */
async function generateDiff(
    filepath: string, 
    ref: TreeEntry, 
    compared: TreeEntry,
): Promise<DiffResult<DataArrayDiff>> {
    // Parse all the data from the files for both commits
    const [ refData, comparedData ] = await Promise.all([
        generateParsedCommit(filepath, ref),
        generateParsedCommit(filepath, compared),
    ]);

    // GUARD: The parsed commit handler may reject any file under certain
    // circumstances. If this is the case, we discard the file
    if (refData === undefined && comparedData === undefined) {
        return;
    }

    // Then diff the two datasets
    const diff = diffDataArray(refData || [], comparedData || []);

    return {
        filepath, 
        diff,
        type: DiffType.EXTRACTED_DATA,
        hasChanges: Object.keys(diff.added).length > 0
            || Object.keys(diff.deleted).length > 0,
    };
}

export default generateDiff;