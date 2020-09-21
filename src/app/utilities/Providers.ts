import { ProviderCommands, DataRequestStatus, ProviderEvents } from 'main/providers/types';
import { faFacebookF, faInstagram, faLinkedinIn, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faSquare } from 'app/assets/fa-light';
import { IpcRendererEvent } from 'electron';

const channel = 'providers';

interface DataRequestReturnType {
    dispatched: Map<string, DataRequestStatus>;
    lastChecked: Date;
    providers: string[];
}

type SubscriptionHandler = (event: IpcRendererEvent, type: ProviderEvents) => void;

class Providers {
    static subscribe(handler: SubscriptionHandler): void {
        window.api.on(channel, handler);
    }

    static unsubscribe(handler: SubscriptionHandler): void {
        window.api.removeListener(channel, handler);
    }

    static initialise(key: string): Promise<boolean> {
        return window.api.invoke(channel, ProviderCommands.INITIALISE, key);
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

    static getDataRequests(): Promise<DataRequestReturnType> {
        return window.api.invoke(channel, ProviderCommands.GET_DISPATCHED_DATA_REQUESTS);
    }

    static getIcon(key: string): IconDefinition {
        switch (key) {
            case 'instagram':
                return faInstagram;
            case 'facebook':
                return faFacebookF;
            case 'linkedin':
                return faLinkedinIn;
            default:
                return faSquare;
        }
    }

}

export default Providers;