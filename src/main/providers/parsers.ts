import path from 'path';

import Facebook from './facebook/parser';
import Instagram from './instagram/parser';
import LinkedIn from './linkedin/parser';
import Spotify from './spotify/parser';
import { ProviderParser } from "./types/Data";

// Contains an overview of parsers, sorted by their provider
const providerParsers: [ ProviderParser[], string ][] = [
    [Instagram, 'instagram'],
    [Facebook, 'facebook'],
    [LinkedIn, 'linkedin'],
    [Spotify, 'spotify'],
];

// Contains an overview of parsers, sorted by the file they parse
export const parsersByFile: Map<string, ProviderParser> = new Map(
    // Loop through all available providers
    providerParsers.flatMap(([parsers, key]): [string, ProviderParser][] => {
        // The loop over all parsers the provider provides
        return parsers.map((parser): [string, ProviderParser] => {
            // Inject the provider key into the parser, so that it may be dealt
            // with later
            parser.provider = key;

            return [
                // Also scope the path to the provider, as the data will be
                // stored relatively to the parser as well
                `${key}/${parser.source}`,
                parser,
            ];
        });
    })
);

// First map all the providers, then show only the paths that are part of a
// particular provider, rather than creating a long list of global filenames
export const parsersByProvider: Map<string, Map<string, ProviderParser>> = new Map(
    providerParsers.map(([parsers, key]) => {
        return [
            key,
            new Map(parsers.map((parser) => {
                return [
                    parser.source,
                    parser
                ];
            }))
        ];
    })
);

/**
 * More intelligently retrieve a particular parser using a filename that might
 * include an account name.
 */
export function getParserByFileName(filepath: string): ProviderParser | void {
    // First, we'll split the filename, where the first directory should match
    // the key of the provider
    const [provider, ...rest] = filepath.split('/');

    // Then we'll retrieve the particular set of parsers for this provider
    const parserMap = parsersByProvider.get(provider);

    // GUARD: If the root directory isn't recognized, we cannot parse this file
    if (!parserMap) {
        return;
    }

    // Attempt to retrieve the parser by omitting the first directory after the
    // root, which in new versions should show the account name
    let parser: ProviderParser;
    parser = parserMap.get(rest.slice(1).join('/'));

    // Alternatively, attempt to retrieve the parser using legacy methods
    if (!parser) {
        parser = parserMap.get(rest.join('/'));
    }

    return parser;
}

export default providerParsers;