import { ProviderDatum } from "main/providers/types/Data";

export type OpenDataRightsDatum = Pick<
    ProviderDatum<unknown, unknown>,
    'data' | 'timestamp' | 'type'
>;

/**
 * Parse a Open Data Rights API-generated data file, and add the requisite
 * metadata to the invididual datapoints. 
 */
function parseOpenDataRights(
    data: OpenDataRightsDatum[],
    hostname: string,
    account: string,
    source: string,
): ProviderDatum<unknown, unknown>[] {
    return data.map((datum: OpenDataRightsDatum) => {
        return {
            ...datum,
            hostname,
            account,
            provider: 'open-data-rights',
            source
        }
    });
}

export default parseOpenDataRights;