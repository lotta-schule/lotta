import { useCallback, useEffect } from 'react';
import { throttle } from 'lodash';

export const useScrollEvent = (callback: (e: Event) => void, throttleThreshold: number = 250, dependencies: unknown[] = []) => {

    const scrollCallback = useCallback(callback, dependencies);

    useEffect(() => {
        const throttledHandleScroll = throttle(scrollCallback, throttleThreshold);
        window.addEventListener('scroll', throttledHandleScroll);
        return () => window.removeEventListener('scroll', throttledHandleScroll);
    }, [scrollCallback, throttleThreshold]);
};