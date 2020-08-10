import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import keytar from 'keytar';
import crypto from 'crypto';
import { app } from 'electron';

const APP_DATA_PATH = process.env.NODE_ENV === 'production' ? app.getPath('userData') : app.getAppPath();
const REPOSITORY_PATH = path.resolve(APP_DATA_PATH, 'data', 'repository');
const ENCRYPTED_FILESYSTEM_PATH = path.join(APP_DATA_PATH, 'data', 'encrypted_repository');
const SERVICE_NAME = 'aeon_encrypted_fs';

// Adapted from https://github.com/rfjakob/gocryptfs/blob/master/Documentation/MANPAGE.md
const ERROR_CODES = {
    0: 'success',
    6: 'CIPHERDIR is not an empty directory (on "-init")',
    10: 'MOUNTPOINT is not an empty directory',
    12: 'password incorrect',
    22: 'password is empty (on "-init")',
    23: 'could not read gocryptfs.conf',
    24: 'could not write gocryptfs.conf (on "-init" or "-password")',
    26: 'fsck found errors',
}

/**
 * Unmount the encryped filesystem for Linux and macOS. The current
 * implementation suppresses any errors.
 */
export function unmountFS(): Promise<void> {
    return new Promise((resolve, reject) => {
        // Spawn umount process
        const ls = spawn('umount', [REPOSITORY_PATH]);

        // Reject the promise if any errors occur
        // ls.stderr.on('data', (err) => reject(err.toString()));
        // ls.on('error', (err) => reject(err.toString()));

        // Reject or resolve the promise based on the error code
        ls.on('close', () => resolve());
        // ls.on('close', code => code === 0 ? resolve() : reject(code));
    });
}

/**
 * Check if the filesystem is intact, with gocryptfs rejecting if the filesystem
 * is damaged or missing.
 */
export function validateFilesystem(): Promise<void> {
    return new Promise((resolve, reject) => {
        const ls = spawn('gocryptfs', ['-info', ENCRYPTED_FILESYSTEM_PATH]);

        // Reject any errors directly
        ls.on('error', (err) => reject(err.toString()));
        ls.stdout.on('data', (data) => console.log(data.toString()));

        // Reject or resolve the promise based on the error code
        ls.on('close', code => code === 0 ? resolve() : reject(code));
    });
}

/**
 * Initialise a new encrypted filesystem at the correct repository, creating the
 * correct directories and initialising the gocryptfs filesystem.
 */
export async function initialiseFilesystem(): Promise<void> {
    console.log('Initialising encrypted filesystem...');

    // GUARD: Create the correct directory if they don't exist yet
    if (!fs.existsSync(ENCRYPTED_FILESYSTEM_PATH)) {
        await fs.promises.mkdir(ENCRYPTED_FILESYSTEM_PATH, { recursive: true });
    }

    if (!fs.existsSync(REPOSITORY_PATH)) {
        await fs.promises.mkdir(REPOSITORY_PATH, { recursive: true });
    }

    // GUARD: Check if REPOSITORY_PATH is empty, since it needs to be for the
    // filesystem to be mounted. This may be a leftover issue if the repository
    // is at some point converted to an encrypted version
    const isDirEmpty = await fs.promises.readdir(REPOSITORY_PATH)
        .then(files => files.length === 0);

    if (!isDirEmpty) {
        throw new Error('The repository path is not empty. Your encryption flag may be set incorrectly, or switching between an encrypted an unencrypted repository may have failed.');
    }

    // Generate a random password and store it in the OS's native keychain
    const password = await crypto.randomBytes(64).toString('hex');
    await keytar.setPassword(SERVICE_NAME, 'encryption_key', password);

    return new Promise((resolve, reject) => {
        const ls = spawn('gocryptfs', ['-init', ENCRYPTED_FILESYSTEM_PATH]);

        // Bind the handler for data that we can check some input events
        ls.stdout.on('data', data => {
            // Parse incoming messages as string
            const message = data.toString() as string;

            // Switch based on several commands
            if (message.includes('Reading Password from stdin')) {
                ls.stdin.write(`${password}\n`);
            }
        });

        // Reject the promise when any errors appear
        ls.stderr.on('data', (err) => reject(err.toString()));
        ls.on('error', (err) => reject(err.toString()));

        // Reject or resolve the promise based on the error code
        ls.on('close', code => code === 0 ? resolve() : reject(code));
    });
}

/**
 * Mount the encrypted filesysted for Linux and macOS
 */
export default function mountCryptoFS(): Promise<void> {
    // GUARD: Skip mounting the encrypted filesystem if encryption is disabled
    if (process.env.ENABLE_ENCRYPTION === 'false') {
        return Promise.resolve();
    }

    return new Promise(async (resolve, reject) => {
        // Do a cursory unmount of the filesystem in case any remnants remain
        await unmountFS();

        try {
            await validateFilesystem();
        } catch (err) {
            console.log('Encrypted filesystem is not initialised...');
            await initialiseFilesystem();
        }

        // Retrieve the password from the keychain
        const password = await keytar.findPassword(SERVICE_NAME);

        // Spawn the filesystem
        const ls = spawn('gocryptfs', ['-fg', ENCRYPTED_FILESYSTEM_PATH, REPOSITORY_PATH]);

        // Bind the handler for data that we can check some input events
        ls.stdout.on('data', data => {
            // Parse incoming messages as string
            const message = data.toString() as string;

            // Switch based on several commands
            if (message.includes('Reading Password from stdin')) {
                ls.stdin.write(`${password}\n`);
            } else if (message.includes('Filesystem mounted and ready')) {
                console.log('Encrypted filesystem was successfully mounted.')
                resolve();
            }
        });

        // Bind error handlers
        ls.stderr.on('data', (err) => reject(err.toString()));
        ls.on('error', (err) => reject(err.toString()));

        // Bind the close handler
        ls.on('close', code => {
            console.log(`gocryptfs child process exited with code ${code}`);
        });     
    });
}