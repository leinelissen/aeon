const utfDecoder = new TextDecoder('utf-8');

/**
 * Decode an optional Buffer containing JSON and beautify it in the process
 * @param buffer 
 */
function optionalJsonDecode(buffer?: void | Buffer | Uint8Array): string {
    // GUARD: If there's no buffer, the file is empty
    if (!buffer) {
        return '';
    }

    // First we decode the buffer to text
    const decodedText = utfDecoder.decode(buffer);

    // Then we'll parse and stringify it, so that it is beautified
    try {
        const parsedJson = JSON.parse(decodedText);
        return JSON.stringify(parsedJson, null, 4);;
    } catch(error) {
        if (error instanceof SyntaxError) {
            return decodedText;
        }
    }
}

export default optionalJsonDecode;