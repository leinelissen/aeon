export interface ParserFile {
    filepath: string;
    data: Buffer;
}

export interface Parser {
    /** The key under which all files will be stored. Should be filesystem-safe
     * (no spaces, all-lowercase) */
    readonly key: string;
    /** Initialise the parser. If usesKeychain is set to true, this function
     * will contain the keychain info for this parser. */
    initialise?(): Promise<void>;
    /** Update the data that is retrieved by this parser. Should return an
     * object with all new files, so they can be saved to disk. */
    update(): Promise<ParserFile[]>;
}