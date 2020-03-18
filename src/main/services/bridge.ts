import Repository from '.';
import { ServiceCommands } from './types';
import { ipcMain, IpcMainInvokeEvent } from 'electron';

class ServiceBridge {
    repository: Repository = null;

    messageCache: [IpcMainInvokeEvent, number][] = [];

    constructor(repository: Repository) {
        this.repository = repository;
        this.repository.on('ready', this.clearMessageCache);

        ipcMain.handle('services', this.handleMessage);
    }

    private handleMessage = async (event: IpcMainInvokeEvent, command: number, ...args: any[]): Promise<void> => {
        // GUARD: Check if the repository is initialised. If not, defer to the
        // messagecache, so that it can be injected later.
        if (!this.repository.isInitialised) {
            this.messageCache.push([event, command]);
            return;
        }
        
        switch(command) {
        case ServiceCommands.UPDATE:
            this.repository.update(args[0]);
            break;
        case ServiceCommands.UPDATE_ALL:
            this.repository.updateAll();
            break;
        }
    }

    private clearMessageCache = (): void => {
        this.messageCache.forEach(args => this.handleMessage(...args));
        this.messageCache = [];
    }
}

export default ServiceBridge;