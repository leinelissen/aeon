import { ProviderDatum, ProviderParser } from 'main/providers/types';

const decoder = new TextDecoder('utf-8');

/**
 * This function recursively travels through an object in order to retrieve any
 * object that contains a particular key. An array with all instances of this
 * key is returned.
 * @param haystack The data which we need to sort through
 * @param needle The key we're looking for
 */
// eslint-disable-next-line
function recursivelyExtractData(haystack: {[key: string]: any}, needle: string): any[] {
    // eslint-disable-next-line
    let data = [];

    // GUARD: If an array does happen to enter the function, we need to send the
    // individual object through the function
    if (Array.isArray(haystack)) {
        // Loop through all items that are in the array
        for (const item of haystack) {
            // Run them through the function
            const result = recursivelyExtractData(item, needle);

            // And then append the result to the return array. Use a spread
            // operator so that we flatten the array that is introduced by this function
            if (result && result.length) {
                data.push(...result);
            }
        }

        return data;
    }

    // In case of an object, we'll loop through all keys and check for a match,
    // or possibly further iteration possibilities
    for (const [key, item] of Object.entries(haystack)) {
        // If the key matches, we just return the whole bunch of data
        if (key === needle) {
            data.push(item);
            break;
        }

        // If the data is an array, we pipe the whole thing back to the
        // recursive function
        if (typeof item === 'object' && item) {
            // Optionally wrap the item in an array so that we can process both
            // cases at once. This is necessary because the item could either be
            // an object with keys or an array with objects.
            const iterable = Array.isArray(item) ? item : [item];

            // Loop through options and extract optional data
            for (const nestedItem of iterable) {
                const result = recursivelyExtractData(nestedItem, needle);
                
                if (result && result.length) {
                    data.push(...result);
                }
            }
        }
    }

    return data;
}

/**
 * Extract all data from a given file according to the provided schema
 * @param file The provided file in buffer format
 * @param provider The provider for this specific set of schemas
 * @param schema A ProviderParser that gives the rules
 */
// eslint-disable-next-line
function parseSchema(file: Buffer | { [key: string] : any }, parser: ProviderParser): ProviderDatum<any, any>[] {
    const { source, provider } = parser;

    // Then we decode the file
    const object = file instanceof Buffer 
        ? JSON.parse(decoder.decode(file))
        : file;

    // GUARD: If there is no object, we cannot extract data from it
    if (!object) {
        return [];
    }

    // Now we can start parsing the file
    return parser.schemas.map((schema): ProviderDatum<unknown, unknown> => {
        const { type, transformer, key } = schema;

        try {
            // We then recursively extract and possibly transform the data
            const extractedData = key ? recursivelyExtractData(object, key) : object;
            const transformedData = transformer 
                ? (Array.isArray(extractedData) ? extractedData.map(transformer) : transformer(extractedData))
                : extractedData;

            // The next thing is a bit tricky because the transformed data
            // might be in one of three forms:
            // 1. The data is untransformed and is basically an array
            //    containing all single values that were extracted from the
            //    file
            // 2. The data is transformed into an array of single items
            // 3. The data is transformed and has yielded multiple items per
            //   original item. It is now basically an array of arrays

            // First we'll handle the cases where the data is transformed.
            // In this case, we expect the transformer to already wrap
            // everything in the correct format, which we should then just
            // append to the normal values.
            if (transformer) {
                // GUARD: Check if what is returned by the transformed is an
                // array as expected.
                if (!Array.isArray(transformedData)) {
                    throw new Error(`A schema transformer must return an array of data (key: '${key}', type: '${type}', file: '${source}')`);
                }

                // eslint-disable-next-line
                // @ts-ignore
                return transformedData.flatMap((data: Partial<ProviderDatum<unknown, unknown>> | Partial<ProviderDatum<unknown, unknown>>[]) => {                
                    // We also introduce another loop so that we can deal
                    // with the case where multiple items are returned per
                    // original item
                    return (Array.isArray(data) ? data : [data]).flatMap(item => ({
                        type,
                        provider,
                        source,
                        ...item,
                    }));
                });
            }
            
            // In case nothing is transformed, we just insert the data as-is
            return transformedData.map((data: Partial<ProviderDatum<unknown, unknown>> | Partial<ProviderDatum<unknown, unknown>>[]) => ({
                type,
                provider,
                source,
                data,
            }));
        } catch (e) {
            console.error(`An error occurred while trying to parse a schema (key: '${key}', type: '${type}', file: '${source})'`, e);
        }
    }).flat();
}

export default parseSchema;