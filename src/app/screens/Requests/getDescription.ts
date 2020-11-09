import { formatDistanceToNow } from 'date-fns';
import { DataRequestStatus } from 'main/providers/types';

/**
 * A helper to convert a particular DataRequestStatus to a human-readable string
 */
export default function getDescription(status?: DataRequestStatus): string {
    if (status?.completed) {
        return `Received data ${formatDistanceToNow(new Date(status.completed))} ago`;
    }

    if (status?.dispatched) {
        return `Requested data ${formatDistanceToNow(new Date(status.dispatched))} ago`;
    }

    return 'No data requested yet';
}