import Matomo from 'matomo-ts';
import { useLocation } from 'react-router-dom';

export const usePiwikAnalytics = () => {
    const { pathname } = useLocation();
    if (window._paq) {
        Matomo.default().trackPageView(pathname);
    }
};
