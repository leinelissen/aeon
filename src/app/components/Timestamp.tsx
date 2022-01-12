import { formatDistanceToNow } from 'date-fns';
import React, { useMemo } from 'react';
import Tooltip from './Tooltip';

interface TimestampProps {
    children?: Date | string | number;
}

function Timestamp({ children: date }: TimestampProps) {
    const parsedDate = useMemo(() => (
        typeof date === 'string'
            ? new Date(date)
            : date
    ), []);

    const relativeTime = useMemo(() => (
        parsedDate ? formatDistanceToNow(parsedDate) : null
    ), [parsedDate]);

    return (
        <Tooltip title={parsedDate?.toLocaleString()}>
            <time dateTime={parsedDate instanceof Date ? parsedDate?.toISOString() : parsedDate?.toString()}>
                {relativeTime ? `${relativeTime} ago` : 'Never'}
            </time>
        </Tooltip>
    );
}

export default Timestamp;
