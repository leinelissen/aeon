import Repository from '.';
import { RepositoryCommands, RepositoryArguments } from './types';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { TREE, WORKDIR, STAGE } from 'isomorphic-git';

/**
 * Replace instances of calls to TREE and STAGE with the appropriate objects, as
 * we can only call those functions in NodeJS.
 */
function replaceArgs(args: any[]) {
    return args.map(arg => {
        switch(arg) {
            case RepositoryArguments.HEAD:
                return TREE({});
            case RepositoryArguments.STAGE:
                return STAGE();
            case RepositoryArguments.WORKDIR:
                return WORKDIR();
            default:
                return arg;
            }
    });
}

class RepositoryBridge {
    repository: Repository = null;

    messageCache: [IpcMainInvokeEvent, number][] = [];

    constructor(repository: Repository) {
        this.repository = repository;
        this.repository.on('ready', this.clearMessageCache);

        ipcMain.handle('repository', this.handleMessage);
    }

    private handleMessage = async (event: IpcMainInvokeEvent, command: number, ...args: any[]): Promise<any> => {
        // GUARD: Check if the repository is initialised. If not, defer to the
        // messagecache, so that it can be injected later.
        if (!this.repository.isInitialised) {
            this.messageCache.push([event, command]);
            return;
        }
        
        switch(command) {
            case RepositoryCommands.LOG:
                return this.repository.log(...args);
            case RepositoryCommands.DIFF:
                return this.repository.diff(...replaceArgs(args));
            case RepositoryCommands.STATUS:
                return this.repository.status(...args);
            case RepositoryCommands.PARSED_COMMIT: {
                return this.repository.getParsedCommit(...replaceArgs(args));
            }
        }
    }

    private clearMessageCache = (): void => {
        this.messageCache.forEach(args => this.handleMessage(...args));
        this.messageCache = [];
    }
}

export default RepositoryBridge;