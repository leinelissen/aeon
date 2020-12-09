import path from 'path';
import { getParserByFileName } from 'main/providers/parsers';
import parseSchema from './parse-schema';
import { ProviderDatum } from "main/providers/types/Data";
import { Blob, TreeEntry } from 'nodegit';
import parseCsv from './parse-csv';
import parseOpenDataRights, { OpenDataRightsDatum } from './parse-open-data-rights';

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

    // Retrieve the data from the tree
    const data = await tree.getBlob();
    const object = await getObjectByExtension(fileExtension, data);

    // GUARD: If the file is open-data-rights based, we don't need any fancy
    // parsers. We can just directly import the data and add the right flags.
    if (filepath.startsWith('open-data-rights')) {
        // Retrieve the hostname and account from the path. Also gather the rest
        // of the path so we can clarify the exact source
        const [, hostname, account, ...rest] = filepath.split('/');
        return parseOpenDataRights(
            object as OpenDataRightsDatum[],
            hostname,
            account,
            rest.join('/')
        );
    }
    
    // We then parse the content and get the relevant parser
    const parser = getParserByFileName(filepath);

    // GUARD: If there's not parser for the file, there's nothing we can do
    if (!parser) {
        return;
    }


    // Retrieve the account from the pathname
    const [, account] = filepath.split('/');

    return parseSchema(object, parser, account);
}

export default generateParsedCommit;