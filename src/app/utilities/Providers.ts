import { ProviderCommands, ProviderEvents, InitialisedProvider } from 'main/providers/types';
import { faFacebookF, faInstagram, faLinkedinIn, faSpotify, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faSquare } from 'app/assets/fa-light';
import { IpcRendererEvent } from 'electron';

const channel = 'providers';

type DataRequestReturnType = {
    lastChecked: Date;
    accounts: Record<string, InitialisedProvider>;
}

type SubscriptionHandler = (event: IpcRendererEvent, type: ProviderEvents) => void;

class Providers {
    static subscribe(handler: SubscriptionHandler): void {
        window.api.on(channel, handler);
    }

    static unsubscribe(handler: SubscriptionHandler): void {
        window.api.removeListener(channel, handler);
    }

    static initialise(key: string, account?: string): Promise<boolean> {
        return window.api.invoke(channel, ProviderCommands.INITIALISE, key, account);
    }

    static update(key: string): Promise<void> {
        return window.api.invoke(channel, ProviderCommands.UPDATE, key);
    }

    static updateAll(): Promise<void> {
        return window.api.invoke(channel, ProviderCommands.UPDATE_ALL);
    }

    static dispatchDataRequest(key: string): Promise<void> {
        return window.api.invoke(channel, ProviderCommands.DISPATCH_DATA_REQUEST, key);
    }

    static dispatchDataRequestToAll(): Promise<void> {
        return window.api.invoke(channel, ProviderCommands.DISPATCH_DATA_REQUEST_TO_ALL);
    }

    static refresh(): Promise<void> {
        return window.api.invoke(channel, ProviderCommands.REFRESH);
    }

    static getAccounts(): Promise<DataRequestReturnType> {
        return window.api.invoke(channel, ProviderCommands.GET_ACCOUNTS);
    }

    static getAvailableProviders(): Promise<Record<string, { requiresEmail: boolean }>> {
        return window.api.invoke(channel, ProviderCommands.GET_AVAILABLE_PROVIDERS);
    }

    static getIcon(key: string): IconDefinition {
        switch (key) {
            case 'instagram':
                return faInstagram;
            case 'facebook':
                return faFacebookF;
            case 'linkedin':
                return faLinkedinIn;
            case 'spotify':
                return faSpotify;
            default:
                return faSquare;
        }
    }

}

export default Providers;