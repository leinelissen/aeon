import path from 'path';
import { parsersByFile } from 'main/providers/parsers';
import parseSchema from './parse-schema';
import { ProviderDatum } from 'main/providers/types';
import { WalkerEntry } from 'isomorphic-git';

const utfDecoder = new TextDecoder('utf-8');

/**
 * A walker function that parses files from a single tree
 */
async function generateParsedCommit(
    filepath: string, 
    entries: Array<WalkerEntry>,
): Promise<ProviderDatum<unknown, unknown>[]> {
    const [ tree ] = entries;

    // GUARD: The tree must exist
    if (!tree) {
        return;
    }

    const data = await tree.content();

    // GUARD: We only work with parseable data
    if (path.extname(filepath) !== '.json') {
        return;
    }

    // GUARD: We cannot process empty files
    if (!data) {
        return;
    }

    // We then parse the content and get the relevant parser
    const object = JSON.parse(utfDecoder.decode(data));
    const parser = parsersByFile.get(filepath);

    // GUARD: If there's not parser for the file, there's nothing we can do
    if (!parser) {
        return;
    }

    return parseSchema(object, parser);
}

export default generateParsedCommit;