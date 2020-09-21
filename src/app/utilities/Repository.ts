import { DiffResult, RepositoryCommands, RepositoryArguments, RepositoryEvents, Commit } from 'main/lib/repository/types';
import { ProviderDatum } from 'main/providers/types';
import type { StatusFile } from 'nodegit';
import { IpcRendererEvent } from 'electron';

const channel = 'repository';

type SubscriptionHandler = (event: IpcRendererEvent, type: RepositoryEvents) => void;

class Repository {
    static subscribe(handler: SubscriptionHandler): void {
        window.api.on(channel, handler);
    }

    static unsubscribe(handler: SubscriptionHandler): void {
        window.api.removeListener(channel, handler);
    }

    static diff(refTree?: string | RepositoryArguments, comparedTree?: string | RepositoryArguments): Promise<DiffResult<unknown>[]> {
        return window.api.invoke(channel, RepositoryCommands.DIFF, refTree, comparedTree);
    }

    static parsedCommit(tree?: string | RepositoryArguments): Promise<ProviderDatum<unknown, unknown>[]> {
        return window.api.invoke(channel, RepositoryCommands.PARSED_COMMIT, tree);
    }

    static log(): Promise<Commit[]> {
        return window.api.invoke(channel, RepositoryCommands.LOG);
    }

    static status(): Promise<StatusFile[]> {
        return window.api.invoke(channel, RepositoryCommands.STATUS);
    }
}

export default Repository;