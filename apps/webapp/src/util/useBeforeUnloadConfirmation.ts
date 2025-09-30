'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

export const useBeforeUnloadConfirmation = (
  enabled: boolean,
  message: string
) => {
  const lastHistoryState = React.useRef(global.history?.state);
  const router = useRouter();
  React.useEffect(() => {
    const storeLastHistoryState = () => {
      lastHistoryState.current = history.state;
    };
    router.events.on('routeChangeComplete', storeLastHistoryState);
    return () => {
      router.events.off('routeChangeComplete', storeLastHistoryState);
    };
  }, [router]);

  React.useEffect(() => {
    let isWarned = false;

    const routeChangeStart = (url: string) => {
      if (router.asPath !== url && enabled && !isWarned) {
        isWarned = true;
        if (confirm(message)) {
          router.push(url);
        } else {
          isWarned = false;
          router.events.emit('routeChangeError');

          // HACK
          const state = lastHistoryState.current;
          if (
            state != null &&
            history.state != null &&
            state.idx !== history.state.idx
          ) {
            history.go(state.idx < history.state.idx ? -1 : 1);
          }

          throw 'Abort route change. Please ignore this error.';
        }
      }
    };

    const beforeUnload = (e: Event) => {
      if (enabled && !isWarned) {
        const event = e || window.event;
        event.returnValue = true;
        return message;
      }
      return null;
    };

    router.events.on('routeChangeStart', routeChangeStart);
    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      router.events.off('routeChangeStart', routeChangeStart);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [message, router, enabled]);
};
