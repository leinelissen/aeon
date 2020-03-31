import path from 'path';
import { diffJson, diffLines, Change } from 'diff';
import { detailedDiff } from 'deep-object-diff';
import { DiffType, ObjectChange } from './types';

const utfDecoder = new TextDecoder('utf-8');

const diffableExtensions = [
    '.json',
    '.md',
];

/**
 * Generates a specific diff according to filetype
 * @param filepath The filepath of the diffed file
 * @param ref The ref Buffer
 * @param compared The compared Buffer
 */
function generateDiff(
    filepath: string, 
    ref: Uint8Array | void, 
    compared: Uint8Array | void
): {
    hasChanges: boolean;
    type: DiffType;
    diff: Change[] | ObjectChange;
} {
    // GUARD: Check if the files are binary blobs
    const extension = path.extname(filepath)
    if (!diffableExtensions.includes(extension)) {
        // If the file is a blob, we return the identifier <BINARY BLOB>
        const diff = diffJson(ref ? '<BINARY BLOB>' : '', compared ? '<BINARY BLOB>' : '');
        
        return {
            diff,
            type: DiffType.BINARY_BLOB,
            hasChanges: !ref || !compared,
        };
    }

    // If not, we try to decode the given buffers
    const refString = ref ? utfDecoder.decode(ref) : null;
    const comparedString = compared ? utfDecoder.decode(compared) : null;

    // GUARD: Check if the file is a JSON file, since in that case we can diff
    // the object rather than the file
    try {
        if (extension === '.json') {
            // Parse the strings
            const refObject = refString ? JSON.parse(refString) : {};
            const comparedObject = comparedString ? JSON.parse(comparedString) : {};
    
            // Return the diff
            const diff = detailedDiff(refObject, comparedObject) as ObjectChange;
            return { 
                diff,
                type: DiffType.OBJECT,
                hasChanges: Object.keys(diff.added).length > 0
                    || Object.keys(diff.deleted).length > 0
                    || Object.keys(diff.updated).length > 0
            }
        }
    } catch {
        //
    }

    // Else we just do a normal diff and return the results
    const diff = diffLines(refString || '', comparedString || '');
    return {
        diff,
        type: DiffType.OTHER,
        hasChanges: diff?.length === 1 && diff[0]?.count === 0
    }
}

export default generateDiff;