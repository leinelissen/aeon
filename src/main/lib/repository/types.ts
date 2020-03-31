import { Change } from 'diff';

export enum DiffType {
    OBJECT = 0xff,
    BINARY_BLOB = 0xfe,
    OTHER = 0xfd,
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
    LOG = 0xff,
    DIFF = 0xfe,
    STATUS = 0xfd,
} 

export enum RepositoryArguments {
    WORKDIR = 0xffff,
    STAGE = 0xfffe,
    HEAD = 0xfffd,
}
