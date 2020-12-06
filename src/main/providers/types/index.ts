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

export enum ProviderUpdateType {
    UPDATE = 'update',
    DATA_REQUEST = 'data_request'
}

export type InitOptionalParameters = {
    accountName?: string;
    apiUrl?: string;
}