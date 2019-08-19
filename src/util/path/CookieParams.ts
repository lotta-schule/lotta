export const CookieParams = {
    getCookieParams: () => ({
        ...(window.location.href.includes(process.env.REACT_APP_APP_BASE_DOMAIN) ? {
            domain: process.env.REACT_APP_APP_BASE_DOMAIN
        } : {})
    }),
}