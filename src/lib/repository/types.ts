import { Change } from 'diff';

export interface DiffResult {
    filepath: string;
    oid: string;
    diff: Change[];
}

export enum RepositoryCommands {
    LOG = 0xff,
    DIFF = 0xfe,
} 
