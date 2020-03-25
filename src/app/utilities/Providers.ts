import { ProviderCommands } from 'main/providers/types';

const channel = 'providers';

class Providers {
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
}

export default Providers;