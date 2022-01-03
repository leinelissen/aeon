import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { Container, Logger as WinstonLogger, format } from 'winston';
import { Console, File } from 'winston/lib/winston/transports';
import { APP_DATA_PATH } from './app-path';

/**
 * Define the types of loggers that should be available for the application.
 * Each string will be automatically assigned a Winston logger.
 */
const loggerCategories = [
    'autoUpdater',
    'email',
    'provider',
    'repository',
] as const;

// Define the directory where the logs are saved
const logDirectory = path.join(APP_DATA_PATH, 'data', 'logs');

// GUARD: Check if the log directory already exists
if (!existsSync(logDirectory)) {
    // Create the directory recursively if it doesn't
    mkdirSync(logDirectory, { recursive: true });
}

/**
 * This object contains all the loggers that are available in this application.
 */
type Logger = {
    [K in typeof loggerCategories[number]]: WinstonLogger;
}

// This container will hold all the loggers.
export const container = new Container();

const customFormatter = format.printf((entry) => {
    // Get all the variables from the entry
    const { timestamp, label, level, message, ...rest } = entry;

    // JSON stringify any additional parameters
    const stringifiedRest = JSON.stringify(rest);

    // Rewrite the mssage with our custom format
    return `[${timestamp}][${label}] ${level}: ${message} ${stringifiedRest === '{}' ? '' : stringifiedRest}`;
});

// Transform the array to an object
const logger = loggerCategories.reduce<Logger>((loggers, categoryName) => {
    // Create the logger object using the default options
    loggers[categoryName] = container.add(categoryName, {
        level: 'info',
        transports: [
            new Console({
                format: format.combine(
                    format.timestamp(),
                    format.colorize(),
                    format.label({ label: categoryName }),
                    customFormatter,
                ),
            }),
            new File({
                filename: path.join(logDirectory, `${categoryName}.log`),
                format: format.combine(
                    format.timestamp(),
                    format.label({ label: categoryName }),
                    customFormatter,
                ),
            })
        ],
    });
    return loggers;
}, {} as Logger);

export default logger;
