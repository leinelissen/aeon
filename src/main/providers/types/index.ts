export interface ProviderFile {
    filepath: string;
    data: Buffer | string;
}

export interface DataRequestStatus {
    // An ISO date describing when the request was dispatched
    dispatched?: string;
    // An ISO data describing when the request was completed
    completed?: string;
    // An ISO data describing when the request was last checked
    lastCheck?: string;
    // An optional identifier for the request
    requestId?: string | number;
}

export interface InitialisedAccount {
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

export enum ProviderUpdateType {
    UPDATE = 'update',
    DATA_REQUEST = 'data_request',
}

export type InitOptionalParameters = {
    accountName?: string;
    apiUrl?: string;
};

