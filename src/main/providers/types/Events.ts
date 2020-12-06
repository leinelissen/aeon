import { DataRequestStatus } from '.';

export enum ProviderCommands {
    UPDATE,
    UPDATE_ALL,
    DISPATCH_DATA_REQUEST,
    DISPATCH_DATA_REQUEST_TO_ALL,
    REFRESH,
    INITIALISE,
    GET_ACCOUNTS,
    GET_AVAILABLE_PROVIDERS
}

export enum ProviderEvents {
    CHECKING_DATA_REQUESTS = 'checking_data_requests',
    DATA_REQUEST_ACTION_REQUIRED = 'data_request_action_required',
    DATA_REQUEST_COMPLETED = 'data_request_completed',
    DATA_REQUEST_DISPATCHED = 'data_request_dispatched',
    UPDATE_COMPLETE = 'update_complete',
    ACCOUNT_CREATED = 'account_created',
    ACCOUNT_DELETED = 'account_deleted',
    READY = 'ready'
}

export type CheckingDataRequests = Record<string, never>;

export interface DataRequestActionRequired {
    provider: string;
    account: string;
    changedFiles: number;
    hostname?: string;
    url?: string;
    status: DataRequestStatus;
}

export type DataRequestCompleted = DataRequestActionRequired;
export type DataRequestDispatched = DataRequestActionRequired;

export interface UpdateComplete {
    provider: string;
    account: string;
    changedFiles: string;
}

export interface AccountCreated {
    provider: string;
    account: string;
    hostname?: string;
    url?: string;
}

export type AccountDeleted = AccountCreated;

export type ProvidersReady = Record<string, never>;