import { EmailClient } from 'main/email-client/types';
import { ProviderFile } from '.';

/**
 * The base structure for any provider. A provider is a back-end (e.g. website,
 * API, organisation, etc.) that can provider data to Aeon.
 */
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

/**
 * A specialised form of a Provider that is able to handle Data Requests as
 * opposed to simple, linear updates. A data request is asynchronous request for
 * data that may take some time to complete.
 */
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

/**
 * A specialised form of a Provider that is able to handle Data Requests as
 * opposed to simple, linear updates. A data request is asynchronous request for
 * data that may take some time to complete.
 */
export abstract class DataRequestProvider extends Provider {
    /** The amount of days that are required between successive data requests */
    public static dataRequestIntervalDays: number;
}

/**
 * A specialised form of a DataRequestProvider that requires email in order to
 * operate. This means concretely, that a user will be required to link an email
 * account to this provider, which is then accessible in the class.
 */
export abstract class EmailDataRequestProvider extends DataRequestProvider {
    /* An email client that is available for use in this provider. This will
    automatically be set by Aeon when constructing the class. */
    protected email: EmailClient;
    setEmailClient(email: EmailClient): void {
        this.email = email;
    }
}

/**
 * A specialised form of a DataRequestProvider that implements the Open Data
 * Rights API. This practically means that users will be required to enter a URL
 * when creating an instance of this provider, which is then available for use
 * in the class itself.
 * NOTE: This type is used primarily in an implemeting class called
 * OpenDataRights (see ../open-data-rights). You don't need to create a seperate
 * class for each organisation implementing an Open Data Rights API.
 * @see https://whitepaper.open-data-rights.org
 */
export abstract class OpenDataRightsProvider extends DataRequestProvider {
    /* The Open Data Rights API URL, for use in the class */
    protected url: string;
    /* A convenience method to pass to withSecureWindow */
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
