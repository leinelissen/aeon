import { Change } from 'diff';
import { ProviderDatum } from 'main/providers/types';

export enum DiffType {
    // An object DiffType is the diff of an regular object
    OBJECT,
    // For the extracted data type, a given object has been run through its
    // parser and thus contains instances of ProviderDatum, rather than just the
    // bare object
    EXTRACTED_DATA,
    // Any unparseable content, such as pictures, videos, etc.
    BINARY_BLOB,
    // If not a blob, we assume the file is a text file, and thus do a
    // line-by-line diff
    TEXT,
}

export interface ObjectChange<O = object> {
    added: O;
    deleted: O;
    updated: O;
}

/**
 * Represents a result from the Diff function.
 * NOTE: The diff result is dependent on the type of file that served as input
 * for it. This means you HAVE TO switch on the DiffType in order to deal with
 * the correct diff.
 */
export interface DiffResult<D> {
    filepath: string;
    diff: D;
    type: DiffType;
    hasChanges: boolean;
}

export type ObjectDiff = ObjectChange<unknown>;
export type ExtractedDataDiff = ObjectChange<ProviderDatum<unknown>[]>
export type BlobDiff = Change[];
export type TextDiff = Change[];

type Status = 'ignored' | 'unmodified' | '*modified' | '*deleted' | '*added' | 'absent' | 'modified' | 'deleted' | 'added' | '*unmodified' | '*absent' | '*undeleted' | '*undeletemodified';

export interface StatusResult {
    filepath: string;
    status: Status;
}

export enum RepositoryCommands {
    LOG,
    DIFF,
    STATUS,
    PARSED_COMMIT
} 

export enum RepositoryArguments {
    WORKDIR,
    STAGE,
    HEAD,
}

export enum RepositoryEvents {
    NEW_COMMIT,
}