import Providers from 'app/utilities/Providers';
import { InitialisedAccount } from "main/providers/types";
import { DataRequestCompleted, ProviderEvents, UpdateComplete } from 'main/providers/types/Events';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { State, useAppDispatch } from '..';
import { fetchAvailableProviders, fetchProviderAccounts } from './actions';

type RequestState = {
    accounts: State['requests']['all']
    map: State['requests']['byKey']
    isLoading: State['requests']['isLoading']['requests'];
}

/**
 * Retrieve all currently active requests
 */
export function useAccounts(): RequestState {
    const requests = useSelector((state: State) => state.accounts);

    return {
        accounts: requests.all,
        map: requests.byKey,
        isLoading: requests.isLoading.requests,
    };
}

/**
 * Retrieve a single provider by key name
 * @param key Provider key
 */
export function useProvider(key: string): InitialisedAccount {
    return useSelector((state: State) => state.accounts.byKey[key]);
}

/**
 * A helper that keeps the providers up-to-date in Redux
 */
export function ProviderSubscription(): null {
    const dispatch = useAppDispatch();
    const history = useHistory();

    // Callback that fetches all requests and providers
    const refreshProviders = useCallback(() => {
        dispatch(fetchProviderAccounts());
        dispatch(fetchAvailableProviders());
    }, [dispatch]);

    // Handler for the events
    const handleEvent = useCallback((none, type: ProviderEvents, ...props) => {
        // Forcefully re-fetch all providers and accounts
        refreshProviders();

        // Optionally send out a notification. based on which event has been returned.
        switch (type) {
            case ProviderEvents.UPDATE_COMPLETE: {
                const [ event ] = props as [ UpdateComplete ];
                const notification = new Notification(
                    'Update Complete',
                    { 
                        body: `There's a new update for ${event.account} on ${event.provider}${event.url && ` (${event.url})`}`,
                    }
                );
                notification.onclick = () => history.push(`/timeline/${event.commitHash}`);
                break;
            }
            case ProviderEvents.DATA_REQUEST_COMPLETED: {
                const [ event ] = props as [ DataRequestCompleted ];
                const notification = new Notification(
                    'Data Request Complete',
                    {
                        body: `A data request for ${event.account} on ${event.provider}${event.url && ` (${event.url})`} was just completed`,
                    }
                );
                notification.onclick = () => history.push(`/timeline/${event.commitHash}`);
                break;
            }
        }

    }, [refreshProviders]);

    useEffect(() => {
        // Subscribe to any events eminating from the providers helpers, on
        // which we'll refresh our set of providers
        Providers.subscribe(handleEvent);

        // Also fetch the providers on mount
        refreshProviders();

        // Unsubscribe when this component is unmounted
        return () => {
            Providers.unsubscribe(handleEvent);
        };
    }, []);

    // This component doesn't render anything
    return null;
}