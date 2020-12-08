import {
    ProviderParser,
    ProvidedDataTypes,
    ProviderDatum
} from "../types/Data";

/**
 * Will transform a string of values seperated by semicolons into an array of strings
 * @param object string
 */
function semiColonSeperatedTransformer(object: string): Partial<ProviderDatum<unknown>>[] {
    return object.split('; ').map((data) => {
        return {
            data
        }
    });
}

const parsers: ProviderParser[] = [
    {
        source: 'Ad_Targeting.csv',        
        schemas: [
            {
                type: ProvidedDataTypes.AD_INTEREST,
                key: 'Company Names',
                transformer: semiColonSeperatedTransformer
            },
            {
                type: ProvidedDataTypes.AD_INTEREST,
                key: 'Fields of Study',
                transformer: semiColonSeperatedTransformer,
            },
            {
                type: ProvidedDataTypes.GENDER,
                key: 'Member Gender',
            },
            {
                type: ProvidedDataTypes.AD_INTEREST,
                key: 'Member Interests',
                transformer: semiColonSeperatedTransformer,
            },
            {
                type: ProvidedDataTypes.USER_LANGUAGE,
                key: 'Interface Locales',
                transformer: semiColonSeperatedTransformer,
            },
            {
                type: ProvidedDataTypes.PLACE_OF_RESIDENCE,
                key: 'Profile Locations',
                transformer: semiColonSeperatedTransformer,
            },
            {
                type: ProvidedDataTypes.AD_INTEREST,
                key: 'Member Skills',
                transformer: semiColonSeperatedTransformer,
            }
        ]
    }
];

export default parsers;