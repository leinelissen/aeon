import { PersistConfig as BasePersistConfig } from 'redux-persist';

declare module "redux-persist" {
    export interface PersistConfig extends BasePersistConfig {
        deserialize: boolean | ((serializedState: string) => unknown);
    }
}