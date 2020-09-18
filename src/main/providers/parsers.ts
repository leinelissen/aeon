import Facebook from './facebook/parser';
import Instagram from './instagram/parser';
import { ProviderParser } from './types';

// Contains an overview of parsers, sorted by their provider
const providerParsers: [ ProviderParser[], string ][] = [
    [Instagram, 'instagram'],
    [Facebook, 'facebook'],
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

export default providerParsers;