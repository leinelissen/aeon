import { faGoogle, faMicrosoft, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { IpcRendererEvent } from 'electron';
import { ImapCredentials } from 'main/email-client/imap';
import { EmailCommands, EmailEvents } from 'main/email-client/types';

const channelName = 'email';

type SubscriptionHandler = (event: IpcRendererEvent, type: EmailEvents) => void;

class Email {
    static subscribe(handler: SubscriptionHandler): void {
        window.api.on(channelName, handler);
    }

    static unsubscribe(handler: SubscriptionHandler): void {
        window.api.removeListener(channelName, handler);
    }

    static initialise(client: string): Promise<string> {
        return window.api.invoke(channelName, EmailCommands.ADD_ACCOUNT, client);
    }

    static initialiseImap({ user, pass, host, port, secure = true }: ImapCredentials) {
        return window.api.invoke(channelName, EmailCommands.ADD_ACCOUNT, 'imap', user, pass, host, port, secure);
    }

    static delete(account: string): Promise<string> {
        return window.api.invoke(channelName, EmailCommands.DELETE_ACCOUNT, account);
    }

    static getAccounts(): Promise<Record<string, string>> {
        return window.api.invoke(channelName, EmailCommands.GET_ACCOUNTS);
    }

    static getClients(): Promise<string[]> {
        return window.api.invoke(channelName, EmailCommands.GET_CLIENTS);
    }

    static testImap({ 
        user,
        pass,
        host,
        port,
        secure = true,
    }: ImapCredentials): Promise<boolean> {
        return window.api.invoke(channelName, EmailCommands.TEST_IMAP, user, pass, host, port, secure);
    }

    static getIcon(clientKey: string): IconDefinition {
        switch (clientKey) {
            case 'gmail':
                return faGoogle;
            case 'outlook':
                return faMicrosoft;
            default:
                return faEnvelope;
        }
    }
}

export default Email;