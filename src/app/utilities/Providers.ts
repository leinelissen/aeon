import { ProviderCommands } from 'main/providers/types';

const channel = 'providers';

class Providers {
    static update(key: string): Promise<void> {
        return window.api.invoke(channel, ProviderCommands.UPDATE, key);
    }

    static updateAll(): Promise<void> {
        return window.api.invoke(channel, ProviderCommands.UPDATE_ALL);
    }
}

export default Providers;