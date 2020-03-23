export interface ProviderFile {
    filepath: string;
    data: Buffer | string;
}

export interface Provider {
    /** The key under which all files will be stored. Should be filesystem-safe
     * (no spaces, all-lowercase) */
    readonly key: string;
    /** Initialise the Provider. If usesKeychain is set to true, this function
     * will contain the keychain info for this Provider. */
    initialise?(): Promise<void>;
    /** Update the data that is retrieved by this Provider. Should return an
     * object with all new files, so they can be saved to disk. */
    update(): Promise<ProviderFile[]>;
}

export enum ProviderCommands {
    UPDATE = 0xff,
    UPDATE_ALL = 0xfe,
}