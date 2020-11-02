import { useCallback , useEffect, useState } from 'react';

import Providers, { DataRequestReturnType } from './Providers';

/**
 * A helper to retrieve all providers from the Provider utility
 */
export default function useRequests(): DataRequestReturnType | null {
    const [requests, setRequests] = useState<DataRequestReturnType>(null);

    const retrieveDataRequests = useCallback(async () => {
        setRequests(await Providers.getDataRequests());
    }, [setRequests]);

    useEffect(() => {
        Providers.subscribe(retrieveDataRequests);
        retrieveDataRequests();

        return () => {
            Providers.unsubscribe(retrieveDataRequests);
        };
    }, []);

    return requests;
}