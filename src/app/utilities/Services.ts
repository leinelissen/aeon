import { ServiceCommands } from 'main/services/types';

const channel = 'services';

class Repository {
    static update(key: string): Promise<void> {
        return window.api.invoke(channel, ServiceCommands.UPDATE, key);
    }

    static updateAll(): Promise<void> {
        return window.api.invoke(channel, ServiceCommands.UPDATE_ALL);
    }
}

export default Repository;