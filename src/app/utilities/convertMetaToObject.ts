import { ProviderUpdateType } from 'main/providers/types';

interface CommitMetadata {
    title: string;
    provider?: string;
    account?: string;
    url?: string;
    hostname?: string;
    updateType?: ProviderUpdateType;
}

/**
 * Convert a full commit message description into a JS-compatible metadata
 * object that can easilby be accessed by the UI
 */
function convertMetaToObject(message: string): CommitMetadata {
    // Split between the title (first line) and the metadata (all other lines)
    const [title, ...metaProperties] = message.split('\n');

    // Loop over each meta line and parse it into an object
    const meta = metaProperties.reduce<CommitMetadata>((sum, line) => {
        // First, split the line by the ': ' seperator, into the key and value
        const [key, value] = line.split(': ');

        // Then, switch on the key and then add the values to the sum object
        // based on any hits
        switch(key) {
            case 'Aeon-Update-Type': {
                // Access the type on the enum
                const type = ProviderUpdateType[value as keyof typeof ProviderUpdateType];
                // Only add the property if the type is solid
                if (type) sum.updateType = type;
                break;
            }
            case 'Aeon-Account':
                sum.account = value;
                break;
            case 'Aeon-Provider':
                sum.provider = value;
                break;
            case 'Aeon-URL':
                sum.url = value;
                break;
            case 'Aeon-Hostname':
                sum.hostname = value;
                break;
        }

        return sum;
    }, { title });

    return meta;
}

export default convertMetaToObject;