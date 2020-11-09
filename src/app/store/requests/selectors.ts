import Providers from 'app/utilities/Providers';
import { DataRequestStatus } from 'main/providers/types';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { State, useAppDispatch } from '..';
import { fetchRequests } from './actions';

type RequestState = {
    providers: State['requests']['allKeys']
    map: State['requests']['byKey']
    isLoading: State['requests']['isLoading']['requests'];
}

/**
 * Retrieve all currently active requests
 */
export function useRequests(): RequestState {
    const requests = useSelector((state: State) => state.requests);

    return {
        providers: requests.allKeys,
        map: requests.byKey,
        isLoading: requests.isLoading.requests,
    };
}

/**
 * Retrieve a single provider by key name
 * @param key Provider key
 */
export function useProvider(key: string): DataRequestStatus {
    return useSelector((state: State) => state.requests.byKey[key]);
}

/**
 * A helper that keeps the providers up-to-date in Redux
 */
export function ProviderSubscription(): null {
    const dispatch = useAppDispatch();

    // Callback that fetched all requests
    const refreshProviders = useCallback(() => {
        dispatch(fetchRequests());
    }, [dispatch]);

    useEffect(() => {
        // Subscribe to any events eminating from the providers helpers, on
        // which we'll refresh our set of providers
        Providers.subscribe(refreshProviders);

        // Also fetch the providers on mount
        refreshProviders();

        // Unsubscribe when this component is unmounted
        return () => {
            Providers.unsubscribe(refreshProviders);
        };
    }, []);

    // This component doesn't render anything
    return null;
}