export interface RouteProps {
    timeline: {
        commitHash?: string;
    }
    data: {
        category?: string;
        datumId?: string;
    },
    requests: {
        provider?: string;
    },
    settings: {
        category?: string;
        settingId?: string;
    },
    graph: {
        datumId?: string;
    }
}