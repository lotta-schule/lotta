import * as React from 'react';
import throttle from 'lodash/throttle';

export const useScrollEvent = (
  callback: (_e: Event) => void,
  throttleThreshold: number = 250,
  dependencies: unknown[] = []
) => {
  const scrollCallback = React.useCallback(callback, [
    callback,
    ...dependencies,
  ]);

  React.useEffect(() => {
    const throttledHandleScroll = throttle(scrollCallback, throttleThreshold);
    window.addEventListener('scroll', throttledHandleScroll);
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [scrollCallback, throttleThreshold]);
};
