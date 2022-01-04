import path from 'path';
import yargs from 'yargs';
import { app } from 'electron';
import { hideBin } from 'yargs/helpers';

// Determine the default appData path
const defaultAppDataPath = process.env.NODE_ENV === 'production' 
    // Default to the default userData directory for production usage
    ? app.getPath('userData')
    // For dev purpose, store it in the same directory
    : path.join(process.cwd(), 'data');

export interface CommandLineArguments {
    /** The path where all data is saved */
    appDataPath: string;
    /** Whether the application should perform any automatic updates */
    autoUpdates: boolean;
    /** The path where the repository should be saved */
    repositoryPath: string;
    /** The path where the logs should be saved */
    logPath: string;
    /* The path where the store should be saved */
    storePath: string;
}

// Set defaults for the command-line arguments
// NOTE: We don't use the yargs default options because it applies conflict
// after resolving the defaults, rather than before.
// NOTE: Defaults are applied in a particular order. Firstly, anything that is set via
// the CLI arguments takes precendence over any defaults. Secondly, if
// appDataPath is set and none of the dependent variables are set, appDataPath
// from the CLI takes precendence over the default appDataPath.
function setDefaults(cliArgs: Partial<CommandLineArguments>): CommandLineArguments {
    return {
        appDataPath: defaultAppDataPath,
        autoUpdates: true,
        repositoryPath: path.join(cliArgs.appDataPath || defaultAppDataPath, 'repository'),
        logPath: path.join(cliArgs.appDataPath || defaultAppDataPath, 'logs'),
        storePath: path.join(cliArgs.appDataPath || defaultAppDataPath, 'store'),
        ...cliArgs,
    };
}

// Parse all the command line arguments using a set schema, using yargs
const cliArguments = yargs(hideBin(process.argv))
    .option('appDataPath', {
        desc: 'Specify the location where all data is saved',
        type: 'string',
    })
    .option('autoUpdates', {
        desc: 'Indicate whether the application should perform any automatic updates',
        type: 'boolean',
    })
    .option('repositoryPath', {
        desc: 'Specify the location where the repository should be saved',
        type: 'string',
        conflicts: ['appDataPath'],
    })
    .option('logPath', {
        desc: 'Specify the location where the logs should be saved',
        type: 'string',
        conflicts: ['appDataPath'],
    })
    .option('storePath', {
        desc: 'Specify the location where the logs should be saved',
        type: 'string',
        conflicts: ['appDataPath'],
    })
    .parserConfiguration({
        'camel-case-expansion': true,
    })
    .help()
    .parseSync() as CommandLineArguments;

// Assign the defaults
const constants = setDefaults(cliArguments);

// Destructure all arguments for easy import
export const {
    appDataPath,
    autoUpdates,
    repositoryPath,
    logPath,
    storePath,
} = constants;
    
export default constants;
