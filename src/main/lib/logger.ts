import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { Container, Logger as WinstonLogger, format } from 'winston';
import { Console, File } from 'winston/lib/winston/transports';
import { logPath } from './constants';

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

// GUARD: Check if the log directory already exists
if (!existsSync(logPath)) {
    // Create the directory recursively if it doesn't
    mkdirSync(logPath, { recursive: true });
}

/**
 * This object contains all the loggers that are available in this application.
 */
type Logger = {
    [K in typeof loggerCategories[number]]: WinstonLogger;
};

// This container will hold all the loggers.
export const container = new Container();

const customFormatter = format.printf((entry) => {
    // Get all the variables from the entry
    const { timestamp, label, level, message, ...rest } = entry;
    const splat: unknown[] = entry[Symbol.for('splat') as unknown as string] || [];
    const args = splat.map((arg) => JSON.stringify(arg)).join(' ');

    // JSON stringify any additional parameters
    const stringifiedRest = JSON.stringify(rest);

    // Rewrite the mssage with our custom format
    return `[${timestamp}][${label}] ${level}: ${message} ${args} ${stringifiedRest === '{}' ? '' : stringifiedRest}`;
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
                    format.errors({ stack: true }),
                    format.colorize(),
                    format.label({ label: categoryName }),
                    customFormatter,
                ),
            }),
            new File({
                filename: path.join(logPath, `${categoryName}.log`),
                format: format.combine(
                    format.timestamp(),
                    format.label({ label: categoryName }),
                    customFormatter,
                ),
            }),
        ],
    });
    return loggers;
}, {} as Logger);

export default logger;
