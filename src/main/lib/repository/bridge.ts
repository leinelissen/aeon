import Repository from '.';
import { RepositoryCommands, RepositoryArguments, RepositoryEvents } from './types';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import WindowStore from '../window-store';

const channelName = 'repository';

class RepositoryBridge {
    repository: Repository = null;

    messageCache: [IpcMainInvokeEvent, number][] = [];

    constructor(repository: Repository) {
        this.repository = repository;
        this.repository.on('ready', this.clearMessageCache);

        ipcMain.handle(channelName, this.handleMessage);
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
                return this.repository.log();
            case RepositoryCommands.DIFF:
                return this.repository.diff(...args);
            case RepositoryCommands.STATUS:
                return this.repository.status(...args);
            case RepositoryCommands.PARSED_COMMIT: {
                return this.repository.getParsedCommit(...args);
            }
        }
    }

    private clearMessageCache = (): void => {
        this.messageCache.forEach(args => this.handleMessage(...args));
        this.messageCache = [];
    }

    /**
     * Send an event to the renderer
     * @param event The event to send out
     */
    public static send(event: RepositoryEvents): void {
        const window = WindowStore.getInstance().window;
        window?.webContents.send(channelName, event);
    }
}

export default RepositoryBridge;