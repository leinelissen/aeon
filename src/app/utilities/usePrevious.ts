import { useRef, useEffect } from 'react';

/**
 * This will return the previous value of an input supplied to the hook
 * @see https://usehooks.com/usePrevious/
 */
function usePrevious<T>(value: T): T {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef(value);
    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)
    return ref.current;
}

export default usePrevious;