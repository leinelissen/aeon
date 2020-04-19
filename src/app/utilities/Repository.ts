import { DiffResult, RepositoryCommands, RepositoryArguments } from 'main/lib/repository/types';
import { ProviderDatum } from 'main/providers/types';
import { ReadCommitResult, StatusRow } from 'isomorphic-git';
import { faInstagram, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faSquare } from '@fortawesome/pro-light-svg-icons';

const channel = 'repository';

class Repository {
    static diff(refTree?: string | RepositoryArguments, comparedTree?: string | RepositoryArguments): Promise<DiffResult<unknown>[]> {
        return window.api.invoke(channel, RepositoryCommands.DIFF, refTree, comparedTree);
    }

    static parsedCommit(tree?: string | RepositoryArguments): Promise<ProviderDatum<unknown, unknown>[]> {
        return window.api.invoke(channel, RepositoryCommands.PARSED_COMMIT, tree);
    }

    static log(): Promise<ReadCommitResult[]> {
        return window.api.invoke(channel, RepositoryCommands.LOG);
    }

    static status(): Promise<StatusRow[]> {
        return window.api.invoke(channel, RepositoryCommands.STATUS);
    }

    static getIcon(key: string): IconDefinition {
        switch(key) {
            case 'instagram':
                return faInstagram;
            default:
                return faSquare;
        }
    }
}

export default Repository;