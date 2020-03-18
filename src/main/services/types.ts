export interface ServiceFile {
    filepath: string;
    data: Buffer | string;
}

export interface Service {
    /** The key under which all files will be stored. Should be filesystem-safe
     * (no spaces, all-lowercase) */
    readonly key: string;
    /** Initialise the Service. If usesKeychain is set to true, this function
     * will contain the keychain info for this Service. */
    initialise?(): Promise<void>;
    /** Update the data that is retrieved by this Service. Should return an
     * object with all new files, so they can be saved to disk. */
    update(): Promise<ServiceFile[]>;
}

export enum ServiceCommands {
    UPDATE = 0xff,
    UPDATE_ALL = 0xfe,
}