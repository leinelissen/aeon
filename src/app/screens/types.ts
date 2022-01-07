import { ProvidedDataTypes } from 'main/providers/types/Data';

export interface RouteProps {
    timeline: {
        commitHash?: string;
    }
    data: {
        category?: ProvidedDataTypes;
        datumId?: string;
    },
    requests: {
        account?: string;
    },
    settings: {
        category?: string;
        settingId?: string;
    },
    graph: {
        datumId?: string;
    },
    'parser-inspector': {
        provider?: string;
    }
}