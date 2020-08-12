import path from 'path';
import { parsersByFile } from 'main/providers/parsers';
import parseSchema from './parse-schema';
import { ProviderDatum } from 'main/providers/types';
import { TreeEntry } from 'nodegit';

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
    if (path.extname(filepath) !== '.json') {
        return;
    }

    // We then parse the content and get the relevant parser
    const object = JSON.parse(tree.toString());
    const parser = parsersByFile.get(filepath);

    // GUARD: If there's not parser for the file, there's nothing we can do
    if (!parser) {
        return;
    }

    return parseSchema(object, parser);
}

export default generateParsedCommit;