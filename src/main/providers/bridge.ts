import Repository from '.';
import { ProviderCommands, ProviderEvents } from './types';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import WindowStore from 'main/lib/window-store';

const channelName = 'providers';

class ProviderBridge {
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
            case ProviderCommands.INITIALISE:
                return this.repository.initialise(args[0]);
            case ProviderCommands.UPDATE:
                return this.repository.update(args[0]);
            case ProviderCommands.UPDATE_ALL:
                return this.repository.updateAll();
            case ProviderCommands.DISPATCH_DATA_REQUEST:
                return this.repository.dispatchDataRequest(args[0]);
            case ProviderCommands.DISPATCH_DATA_REQUEST_TO_ALL:
                return this.repository.dispatchDataRequestToAll();
            case ProviderCommands.REFRESH:
                return this.repository.refresh();
            case ProviderCommands.GET_DISPATCHED_DATA_REQUESTS:
                return {
                    dispatched: this.repository.dispatchedDataRequests, 
                    lastChecked: this.repository.lastDataRequestCheck,
                    providers: Array.from(this.repository.instances.keys()),
                };
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
    public static send(event: ProviderEvents): void {
        const window = WindowStore.getInstance().window;
        window.webContents.send(channelName, event);
    }
}

export default ProviderBridge;