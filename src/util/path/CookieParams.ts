import { CookieAttributes } from 'js-cookie';

export const CookieParams = {
    getCookieParams: (): CookieAttributes => ({
        ...(window.location.href.includes(process.env.REACT_APP_APP_BASE_DOMAIN) ? {
            domain: process.env.REACT_APP_APP_BASE_DOMAIN
        } : {}),
        expires: 30
    }),
}