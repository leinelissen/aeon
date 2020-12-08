import Repository from 'app/utilities/Repository';
import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '..';
import { fetchParsedCommit } from './actions';

export function RepositorySubscription(): JSX.Element {
    const dispatch = useAppDispatch();

    // A handler for when a new commit is made by the repository
    const handleRepositoryEvent = useCallback(() => {
        dispatch(fetchParsedCommit());
    }, [dispatch]);

    useEffect(() => {
        // Fetch the parsed commit on application mount
        dispatch(fetchParsedCommit());

        // Then listen for any new commits
        Repository.subscribe(handleRepositoryEvent);

        // And unsubscribe when the application is unmounted
        return () => {
            Repository.unsubscribe(handleRepositoryEvent);
        };
    }, []);

    return null;
}