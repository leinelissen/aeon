import path from 'path';

/**
 * Unwrap a provider source that is either a string or a string array. As per
 * the provider spec, we need to concatenate a string array with `path.join`.
 */
function unwrapParserSource(source: string | string[]) {
    return Array.isArray(source)
        ? path.join(...source)
        : source;
}

export default unwrapParserSource;