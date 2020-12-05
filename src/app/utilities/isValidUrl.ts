/**
 * Determine if the input is a valid URL
 * https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
 * @param input 
 */
function isValidUrl(input: string): boolean {
    try {
        new URL(input);
    } catch (_) {
        return false;  
    }

    return true;
}

export default isValidUrl;