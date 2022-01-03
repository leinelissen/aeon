import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export interface CommandLineArguments {
    /** Indicates that the application should not perform any automatic updates */
    noAutoUpdates?: boolean;
    /** Specifies the location where the repository should be saved */
    repositoryDirectory?: string;
}

// Parse all the command line arguments using a set schema
const cliArguments = yargs(hideBin(process.argv))
    .option('noAutoUpdates', {
        default: false,
        desc: 'Indicates that the application should not perform any automatic updates',
        type: 'boolean'
    })
    .option('repositoryDirectory', {
        desc: 'Specifies the location where the repository should be saved',
        type: 'string',
    })
    .parserConfiguration({
        'camel-case-expansion': true,
    })
    .help()
    .parseSync() as CommandLineArguments;
    
export default cliArguments;
