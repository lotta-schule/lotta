import JwtDecode from 'jwt-decode';
import { add } from 'date-fns';
import { NextMiddleware, NextResponse } from 'next/server';

export const middleware: NextMiddleware = async (request, event) => {
    const response = NextResponse.next();
    const jwt = request.headers.get('authorization')?.replace(/^Bearer /, '');
    if (jwt) {
        const decoded = JwtDecode(jwt, { header: false });
        const expires = new Date((decoded as any).exp * 1000);
        if (expires.getTime() > new Date().getTime() + 30_000) {
            // If token seems legit and does not expire in next 30 seconds,
            // keep it and go on.
            // A more thorough validation will be made on API side
            return response;
        }
    }
    // Following code executes when there is no (up-to-date)
    // jwt token available on the request Authorization header
    const refreshToken = request.cookies['SignInRefreshToken'];

    if (!refreshToken) {
        return response;
    }

    const decoded = JwtDecode(refreshToken);
    const expires = new Date((decoded as any).exp * 1000);
    if (expires.getTime() < new Date().getTime() + 10_000) {
        // token has/will expire in next 10 seconds, so don't
        // bother refreshing it, could be too late, let the
        // user just sign in again
        response.cookie('SignInRefreshToken', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        return response;
    }

    // We made it here so it seems we have a valid refresh token.
    // We'll make an auth token from it and swap the refreshToken
    // in order to authenticate the request
    try {
        const refreshUrl = `${process.env.API_URL}/auth/token/refresh`;
        const refreshResponse = await fetch(refreshUrl, {
            method: 'POST',
            headers: request.headers,
        });
        const refreshResponseData = await refreshResponse?.json();
        if (refreshResponseData?.accessToken) {
            response.headers.set(
                'authorization',
                `Bearer ${refreshResponseData.accessToken}`
            );
            response.cookie('AuthToken', refreshResponseData.accessToken, {
                expires: add(new Date(), { minutes: 2 }),
                httpOnly: false,
            });
        }
        const refreshCookieValue = refreshResponse.headers.get('set-cookie');

        // set new refresh token on response
        const signInRefreshToken = refreshCookieValue?.match(
            /signinrefreshtoken=(.+);/gi
        )?.[1];
        if (signInRefreshToken) {
            response.cookie('SignInRefreshToken', signInRefreshToken, {
                httpOnly: true,
                expires,
            });
        }
    } catch (e) {
        console.error('User Token handling eror: ', e);
    } finally {
        return response;
    }
};
