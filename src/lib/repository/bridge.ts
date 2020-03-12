import Repository from '.';
import { RepositoryCommands } from './types';
import { ipcMain, IpcMainInvokeEvent } from 'electron';

class RepositoryBridge {
    repository: Repository = null;

    messageCache: [IpcMainInvokeEvent, number][] = [];

    constructor(repository: Repository) {
        this.repository = repository;
        this.repository.on('ready', this.clearMessageCache);

        ipcMain.handle('repository', this.handleMessage);
        console.log('REGISTERED HANDLER', this.repository);
    }

    private handleMessage = async (event: IpcMainInvokeEvent, command: number): Promise<any> => {
        // GUARD: Check if the repository is initialised. If not, defer to the
        // messagecache, so that it can be injected later.
        if (!this.repository.isInitialised) {
            this.messageCache.push([event, command]);
            return;
        }

        console.log('Repository Message: ', event);
        
        switch(command) {
        case RepositoryCommands.LOG:
            return await this.repository.log();
        }
    }

    private clearMessageCache = (): void => {
        this.messageCache.forEach(args => this.handleMessage(...args));
        this.messageCache = [];
    }
}

export default RepositoryBridge;