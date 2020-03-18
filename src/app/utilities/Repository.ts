import { DiffResult, RepositoryCommands, RepositoryArguments } from 'main/lib/repository/types';
import { ReadCommitResult, StatusRow } from 'isomorphic-git';

const channel = 'repository';

class Repository {
    static diff(refTree?: string | RepositoryArguments, comparedTree?: string | RepositoryArguments): Promise<DiffResult[]> {
        return window.api.invoke(channel, RepositoryCommands.DIFF, refTree, comparedTree);
    }

    static log(): Promise<ReadCommitResult[]> {
        return window.api.invoke(channel, RepositoryCommands.LOG);
    }

    static status(): Promise<StatusRow[]> {
        return window.api.invoke(channel, RepositoryCommands.STATUS);
    }
}

export default Repository;