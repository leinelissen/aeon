import { Change } from 'diff';

export enum DiffType {
    OBJECT,
    BINARY_BLOB,
    OTHER,
}

export interface ObjectChange {
    added: object;
    deleted: object;
    updated: object;
}

export interface DiffResult {
    filepath: string;
    oid: string;
    diff: Change[] | ObjectChange;
    type: DiffType;
    hasChanges: boolean;
}

type Status = 'ignored' | 'unmodified' | '*modified' | '*deleted' | '*added' | 'absent' | 'modified' | 'deleted' | 'added' | '*unmodified' | '*absent' | '*undeleted' | '*undeletemodified';

export interface StatusResult {
    filepath: string;
    status: Status;
}

export enum RepositoryCommands {
    LOG,
    DIFF,
    STATUS,
} 

export enum RepositoryArguments {
    WORKDIR,
    STAGE,
    HEAD,
}
