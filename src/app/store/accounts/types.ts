import { DataRequestStatus } from 'main/providers/types';

export interface EmailProvider {
    organisation: string;
    emailAccount: string;
    status: DataRequestStatus;
    account: string;
    provider: 'email';
}