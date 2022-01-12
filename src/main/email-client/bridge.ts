import { ipcMain, IpcMainInvokeEvent } from 'electron';
import logger from 'main/lib/logger';
import WindowStore from 'main/lib/window-store';
import EmailManager from '.';
import { EmailCommands } from './types';

const channelName = 'email';

/**
 * This class acts a bridge between the class that handles all email aspects,
 * and the app-side frontend.
 */
class EmailBridge {
    manager: EmailManager;

    constructor(manager: EmailManager) {
        this.manager = manager;

        // Start listening for commands on the set channel name
        ipcMain.handle(channelName, this.handleMessage);

        // Subscribe to manager-initated events
        this.manager.addListener('*', function () {
            // Log the event
            logger.email.info(`New event: ${JSON.stringify(this.event)}`);

            // And pass them on to the app
            EmailBridge.send(this.event);
        });
    }

    // eslint-disable-next-line
    private handleMessage = (event: IpcMainInvokeEvent, command: number, ...args: any[]): Promise<any> => {
        switch (command) {
            case EmailCommands.GET_CLIENTS:
                return Promise.resolve(this.manager.emailClients.keys());
            case EmailCommands.GET_ACCOUNTS:
                return Promise.resolve(Object.fromEntries(this.manager.initialisedEmailAddress));
            case EmailCommands.ADD_ACCOUNT:
                return this.manager.initialiseNewAddress(args[0]);
            case EmailCommands.DELETE_ACCOUNT:
                return Promise.resolve(this.manager.deleteAccount(args[0]));
        }
    };

    /**
     * Send an event to the renderer
     * @param event The event to send out
     */
    public static send(event: string): void {
        const window = WindowStore.getInstance().window;
        window?.webContents.send(channelName, event);
    }
}

export default EmailBridge;