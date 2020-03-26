import { BrowserWindow } from 'electron';

export interface ProviderFile {
    filepath: string;
    data: Buffer | string;
}

export interface Provider {
    /** Initialise the Provider. If usesKeychain is set to true, this function
     * will contain the keychain info for this Provider. */
    initialise?(): Promise<void>;
}

export abstract class Provider {
    /** The key under which all files will be stored. Should be filesystem-safe
     * (no spaces, all-lowercase) */
    private static key: string;
    // @ts-ignore
    public get key(): string { return this.constructor['key'] };
    public set key(value: string) { 
        // @ts-ignore
        this.constructor['key'] = value; 
    };
    public get name(): string { return this.constructor['name'] };
    /** Update the data that is retrieved by this Provider. Should return an
     * object with all new files, so they can be saved to disk. */
    abstract update(): Promise<ProviderFile[]>;
}

export interface DataRequestProvider extends Provider {
    /** Dispatch a data request to this Provider. The difference between a
     * regular update and a data request, is that it is asynchronous, and might
     * take a couple hours or even days to complete. */
    dispatchDataRequest?(): Promise<void>;
    /** Check if the data request is already complete */
    isDataRequestComplete?(): Promise<boolean>;
    /** If the data request has been completed, download the resulting dump and
     * parse it, so that it can be processed and saved to the repository */
    parseDataRequest?(): Promise<ProviderFile[]>;
}

export abstract class DataRequestProvider extends Provider {
    /** The amount of days that are required between successive data requests */
    private static dataRequestIntervalDays: number;
    /** The amount of days that are required between successive data requests */
    // @ts-ignore
    public get dataRequestIntervalDays(): number { return this.constructor['dataRequestIntervalDays'] };
    public set dataRequestIntervalDays(value: number) { 
        // @ts-ignore
        this.constructor['dataRequestIntervalDays'] = value; 
    };
}

export interface WithWindow {
    window: BrowserWindow;
    constructor: Function;
}

export interface DataRequestStatus {
    dispatched: Date;
    completed?: Date;
    lastCheck?: Date;
}

export enum ProviderCommands {
    UPDATE = 0xff,
    UPDATE_ALL = 0xfe,
    DISPATCH_DATA_REQUEST = 0xfd,
    DISPATCH_DATA_REQUEST_TO_ALL = 0xfc,
    REFRESH_DATA_REQUESTS = 0xfb,
}