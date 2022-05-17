import { ImapFlow } from 'imapflow';
import logger from 'main/lib/logger';

/**
 * Attempt to connect to an IMAP server with a bunch of credentials in order to
 * ascertain whether all the settings are right.
 */
export async function testImap(
    user: string,
    pass: string,
    host: string,
    port: number,
    secure = true,
): Promise<boolean> {
    const client = new ImapFlow({
        host, 
        port, 
        auth: {
            user,
            pass,
        },
        secure,
        logger: logger.email,
    });

    try {
        // Attempt to connect
        await client.connect();
    } catch {
        // If an error is thrown, return false
        return false;
    }

    // If nothing gets thrown, disconnect the client.
    await client.close();

    return true;
}
