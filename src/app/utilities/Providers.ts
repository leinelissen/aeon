import { ProviderCommands, DataRequestStatus, Provider, ProviderEvents } from 'main/providers/types';
import { faInstagram, IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faSquare } from '@fortawesome/pro-light-svg-icons';

const channel = 'providers';

class Providers {
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

    static refreshDataRequests(): Promise<void> {
        return window.api.invoke(channel, ProviderCommands.REFRESH_DATA_REQUESTS);
    }

    static getDataRequests(): Promise<[Map<string, DataRequestStatus>, Date]> {
        return window.api.invoke(channel, ProviderCommands.GET_DISPATCHED_DATA_REQUESTS);
    }

    static getIcon(key: string): IconDefinition {
        switch (key) {
            case 'instagram':
                return faInstagram;
            default:
                return faSquare;
        }
    }
}

export default Providers;