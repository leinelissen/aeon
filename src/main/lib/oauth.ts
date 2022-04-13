import crypto from 'crypto';

/**
 * Generate a secure code_verifier for further use with Google Oauth
 */
export function generateVerifier(): string {
    // This is a verifier code used by the API to check stuff
    const randomString = crypto.randomBytes(96).toString('base64');

    // The valid characters in the code_verifier are [A-Z]/[a-z]/[0-9]/
    // "-"/"."/"_"/"~". Base64 encoded strings are pretty close, so we're just
    // swapping out a few chars.
    // src: https://github.com/googleapis/google-auth-library-nodejs/blob/d4e56c0937adbf9561d5ca3860a1bde623696db7/src/auth/oauth2client.ts#L560
    const verifier = randomString
        .replace(/\+/g, '~')
        .replace(/=/g, '_')
        .replace(/\//g, '-');

    return verifier;
}

/**
 * Convert a dictionary JS object to a URL-encoded parameter string
 */
export function objectToUrlParams(data: Record<string, unknown>) {
    return Object.keys(data).reduce((uri, key, i) => {
        return `${uri}${i === 0 ? '?' : '&'}${key}=${data[key]}`;
    }, '');
}