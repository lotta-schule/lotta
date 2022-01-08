import * as React from 'react';
import { useRouter } from 'next/router';

import NProgress from 'nprogress';

export const TopProgressBar = () => {
    const router = useRouter();

    const enable = () => {
        NProgress.start();
    };
    const disable = () => {
        NProgress.done();
    };

    React.useEffect(() => {
        router.events.on('routeChangeStart', enable);
        router.events.on('routeChangeComplete', disable);
        router.events.on('routeChangeError', disable);
        return () => {
            router.events.off('routeChangeStart', enable);
            router.events.off('routeChangeComplete', disable);
            router.events.off('routeChangeError', disable);
        };
    });
    return null;
};

export default TopProgressBar;
