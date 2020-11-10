import Email from 'app/utilities/Email';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '..';
import { fetchAccounts } from './actions';

/**
 * A helper that keeps the providers up-to-date in Redux
 */
export function EmailSubscription(): null {
    const dispatch = useAppDispatch();

    // Callback that fetched all requests
    const refreshAccounts = useCallback(() => {
        console.log('Received email update event');
        dispatch(fetchAccounts());
    }, [dispatch]);

    useEffect(() => {
        // Subscribe to any events eminating from the providers helpers, on
        // which we'll refresh our set of providers
        console.log('Subscribing for new email events...');
        Email.subscribe(refreshAccounts);

        // Also fetch the providers on mount
        refreshAccounts();

        // Unsubscribe when this component is unmounted
        return () => {
            Email.unsubscribe(refreshAccounts);
        };
    }, []);

    // This component doesn't render anything
    return null;
}