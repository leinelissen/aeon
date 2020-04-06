import path from 'path';
import { diffJson, diffLines, Change } from 'diff';
import { detailedDiff } from 'deep-object-diff';
import { DiffType, ObjectChange, ObjectDiff, TextDiff, ExtractedDataDiff, BlobDiff } from '../types';
import parseSchema from './parse-schema';
import { parsersByFile } from 'main/providers/parsers';

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
    diff: ObjectDiff | TextDiff | ExtractedDataDiff | BlobDiff;
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
            
            // Now that we've calculated the diff, we might as well try to
            // extract the data from the files using JSON. This does depend on
            // whether there is a parser available for the particular file.
            // We'll start out by tring to find a parser for the current file
            const parser = parsersByFile.get(filepath);
            // And if the parser is there, we'll extract the data for the three keys
            const extractedDiff = parser ? {
                added: parseSchema(diff.added, parser),
                deleted: parseSchema(diff.deleted, parser),
                updated: parseSchema(diff.updated, parser),
            } : undefined;

            return { 
                // We return the extracted data if it exists
                diff: extractedDiff || diff,
                // And modify the DiffType accordingly
                type: extractedDiff ? DiffType.OBJECT : DiffType.EXTRACTED_DATA,
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
        type: DiffType.TEXT,
        hasChanges: diff?.length === 1 && diff[0]?.count === 0
    }
}

export default generateDiff;