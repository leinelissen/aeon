import path from 'path';
import { getParserByFileName } from 'main/providers/parsers';
import parseSchema from './parse-schema';
import { ProviderDatum } from 'main/providers/types';
import { Blob, TreeEntry } from 'nodegit';
import parseCsv from './parse-csv';

const utfDecoder = new TextDecoder('utf-8');

/**
 * The extensions that shall be parsed
 */
const parsedExtensions = [
    '.json',
    '.csv',
] as const;

type ParsedExtension = typeof parsedExtensions[number];

/**
 * 
 * @param extension The file extension
 * @param blob The nodegit-provided blob object that is referencing the actual data
 */
function getObjectByExtension(extension: ParsedExtension, blob: Blob) {
    switch(extension) {
        case '.json': {
            return JSON.parse(utfDecoder.decode(blob.content()));
        }
        case '.csv': {
            return parseCsv(blob);
        }
        default: {
            throw Error(`Cannot handle filetype of ${extension}`);
        }
    }
}

/**
 * A walker function that parses files from a single tree
 */
async function generateParsedCommit(
    filepath: string, 
    tree: TreeEntry,
): Promise<ProviderDatum<unknown, unknown>[]> {
    // GUARD: The tree must exist
    if (!tree) {
        return;
    }

    // GUARD: We only work with parseable data
    const fileExtension = path.extname(filepath) as ParsedExtension;
    if (!parsedExtensions.includes(fileExtension)) {
        return;
    }
    
    // We then parse the content and get the relevant parser
    const parser = getParserByFileName(filepath);

    // GUARD: If there's not parser for the file, there's nothing we can do
    if (!parser) {
        return;
    }
    
    // Retrieve the data from the tree
    const data = await tree.getBlob();
    const object = await getObjectByExtension(fileExtension, data);

    return parseSchema(object, parser);
}

export default generateParsedCommit;