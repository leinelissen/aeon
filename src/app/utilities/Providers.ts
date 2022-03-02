import { InitOptionalParameters, InitialisedAccount } from 'main/providers/types';
import { ProviderCommands, ProviderEvents } from 'main/providers/types/Events';
import { faFacebookF, faInstagram, faLinkedinIn, faSpotify, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faSquare } from '@fortawesome/free-solid-svg-icons';
import { IpcRendererEvent } from 'electron';
import faOpenDataRights from 'app/assets/open-data-rights';

const channel = 'providers';

type DataRequestReturnType = {
    lastChecked: Date;
    accounts: Record<string, InitialisedAccount>;
};

type SubscriptionHandler = (event: IpcRendererEvent, type: ProviderEvents, ...props: unknown[]) => void;

class Providers {
    static subscribe(handler: SubscriptionHandler): void {
        window.api.on(channel, handler);
    }

    static unsubscribe(handler: SubscriptionHandler): void {
        window.api.removeListener(channel, handler);
    }

    static initialise(key: string, optional?: InitOptionalParameters): Promise<boolean> {
        return window.api.invoke(channel, ProviderCommands.INITIALISE, key, optional);
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

    static getAvailableProviders(): Promise<Record<string, { requiresEmail: boolean, requiresUrl: boolean }>> {
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
            case 'open-data-rights':
                return faOpenDataRights;
            case 'email':
                return faEnvelope;
            default:
                return faSquare;
        }
    }

    static getPrivacyEmail(key: string): string {
        switch (key) {
            case 'spotify':
                return 'privacy@spotify.com';
            default: 
                return '';
        }
    }

}

export default Providers;