import Providers, { providers as availableProviders }  from '.';
import { ProviderCommands, ProviderEvents } from "./types/Events";
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import WindowStore from 'main/lib/window-store';
import { ProviderUnion } from './types/Provider';

const channelName = 'providers';

class ProviderBridge {
    providers: Providers = null;

    messageCache: [IpcMainInvokeEvent, number][] = [];

    constructor(providers: Providers) {
        this.providers = providers;
        this.providers.on('ready', this.clearMessageCache);

        ipcMain.handle(channelName, this.handleMessage);

        // Subscribe to manager-initated events
        this.providers.addListener('*', function(...props) {
            // Log the event
            console.log('[PROVIDER-EVENT]: ', this.event);

            // And pass them on to the app
            ProviderBridge.send(this.event, ...props);
        });
    }

    // eslint-disable-next-line
    private handleMessage = async (event: IpcMainInvokeEvent, command: number, ...args: any[]): Promise<any> => {
        // GUARD: Check if the repository is initialised. If not, defer to the
        // messagecache, so that it can be injected later.
        if (!this.providers.isInitialised) {
            this.messageCache.push([event, command]);
            return;
        }
        
        switch(command) {
            case ProviderCommands.INITIALISE:
                return this.providers.initialise(args[0], args[1]);
            case ProviderCommands.UPDATE:
                return this.providers.update(args[0]);
            case ProviderCommands.UPDATE_ALL:
                return this.providers.updateAll();
            case ProviderCommands.DISPATCH_DATA_REQUEST:
                return this.providers.dispatchDataRequest(args[0]);
            case ProviderCommands.DISPATCH_DATA_REQUEST_TO_ALL:
                return this.providers.dispatchDataRequestToAll();
            case ProviderCommands.REFRESH:
                return this.providers.refresh();
            case ProviderCommands.GET_AVAILABLE_PROVIDERS:
                return availableProviders.reduce<Record<string, { requiresEmail: boolean, requiresUrl: boolean, }>>((sum, Client) => {
                    sum[(Client as unknown as ProviderUnion).key] = {
                        requiresEmail: (Client as unknown as ProviderUnion).requiresEmail,
                        requiresUrl: (Client as unknown as ProviderUnion).requiresUrl,
                    }
                    return sum;
                }, {});
            case ProviderCommands.GET_ACCOUNTS:
                return {
                    lastChecked: this.providers.lastDataRequestCheck?.toString(),
                    accounts: Object.fromEntries(this.providers.accounts),
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
    public static send(event: ProviderEvents, ...props: unknown[]): void {
        const window = WindowStore.getInstance().window;
        window?.webContents.send(channelName, event, ...props);
    }
}

export default ProviderBridge;