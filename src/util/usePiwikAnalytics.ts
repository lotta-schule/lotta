import useRouter from "use-react-router";
import Matomo from "matomo-ts";

export const usePiwikAnalytics = () => {
    const { location } = useRouter();
    if (window._paq) {
        Matomo.default().trackPageView(location.pathname);
    }
};