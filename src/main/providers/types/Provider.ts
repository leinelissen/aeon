import { EmailClient } from 'main/email-client/types';
import { DataRequestStatus, ProviderFile } from '.';


export interface InitialisedProvider {
    // The key for the provider that supplies the data
    provider: string;
    // The account from which the data emanates
    account?: string;
    // A URL that is associated with a provider that handles APIs
    url?: string;
    // A path- and URL-safe version of the URL
    hostname?: string;
    // A random hash which ensures that sessions are kept between various
    // invocations of browser windows.
    windowKey: string;
    status: DataRequestStatus;
}

export abstract class Provider {
    protected accountName?: string;
    protected windowKey: string;
    /** The key under which all files will be stored. Should be filesystem-safe
     * (no spaces, all-lowercase) */
    public static key: string;
    /** Update the data that is retrieved by this Provider. Should return an
     * object with all new files, so they can be saved to disk. Alternatively,
     * should return false to indicate that no update was carried out. */
    abstract update(): Promise<ProviderFile[]> | Promise<false>;
    /** Initialise the provider. This function is called only when it is
     * initialised for the first time during onboarding. The return boolean
     * indicates whether the provider succeeded in initialising, ie. by logging
     * into a particular service */
    abstract initialise(accountName?: string): Promise<string>;
    constructor(windowKey: string, accountName?: string) {
        this.accountName = accountName;
        this.windowKey = windowKey;
    }
}

export interface DataRequestProvider extends Provider {
    /** Dispatch a data request to this Provider. The difference between a
     * regular update and a data request, is that it is asynchronous, and might
     * take a couple hours or even days to complete.
     * Optionall, this request may return a string or number that indicates some
     * request identifier. This id is then reinserted into the other two methods */
    dispatchDataRequest?(): Promise<void> | Promise<string | number>;
    /** Check if the data request is already complete */
    isDataRequestComplete?(identifier?: string | number): Promise<boolean>;
    /** If the data request has been completed, download the resulting dump and
     * parse it, so that it can be processed and saved to the repository */
    parseDataRequest?(extractionPath: string, identifier?: string | number): Promise<ProviderFile[]>;
}

export abstract class DataRequestProvider extends Provider {
    /** The amount of days that are required between successive data requests */
    public static dataRequestIntervalDays: number;
}

export abstract class EmailDataRequestProvider extends DataRequestProvider {
    protected email: EmailClient;
    setEmailClient(email: EmailClient): void {
        this.email = email;
    }
}

export abstract class OpenDataRightsProvider extends DataRequestProvider {
    protected url: string;
    protected windowParams: {
        key: string;
        origin: string;
    };
    setUrl(url: string): void {
        this.url = url;
        this.windowParams = {
            key: this.windowKey,
            origin: url,
        };
    }
}

export type ProviderUnion = typeof DataRequestProvider | typeof Provider | typeof EmailDataRequestProvider;
