import * as React from 'react';
import { AppContext, AppProps } from 'next/app';
import { add } from 'date-fns';
import { config } from '@fortawesome/fontawesome-svg-core';
import { ServerDownError } from 'error/ServerDownError';
import { TenantNotFoundError } from 'error/TenantNotFoundError';
import { getApolloClient } from 'api/client';
import { AppContextProviders } from 'layout/AppContextProviders';
import axios from 'axios';
import dynamic from 'next/dynamic';
import JwtDecode from 'jwt-decode';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

import 'nprogress/nprogress.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

const TopProgressBar = dynamic(() => import('shared/TopProgressBar'), {
    ssr: false,
});

const LottaWebApp = ({
    Component,
    pageProps: {
        categories,
        currentUser,
        error,
        requestBaseUrl,
        tenant,
        ...componentProps
    },
}: AppProps) => {
    if (error) {
        return <ServerDownError error={error} />;
    }

    if (!tenant) {
        return <TenantNotFoundError />;
    }

    return (
        <AppContextProviders
            tenant={tenant}
            categories={categories}
            currentUser={currentUser}
            requestBaseUrl={requestBaseUrl}
        >
            <TopProgressBar />
            <Component {...componentProps} />
        </AppContextProviders>
    );
};

LottaWebApp.getInitialProps = async (context: AppContext) => {
    const getProtocol = () => {
        if (!context.ctx.req) {
            return 'http';
        }
        const proto =
            (context.ctx.req.headers['x-forwarded-proto'] as
                | string
                | undefined) ||
            ((context.ctx.req.connection as any).encrypted ? 'https' : 'http');
        return proto.split(/\s*,\s*/)[0];
    };
    const url =
        process.env.FORCE_BASE_URL ??
        (context.ctx.req &&
            `${getProtocol()}://${context.ctx.req.headers.host}`);

    const headers = context.ctx.req?.headers ?? {};

    await maybeChangeRefreshToken(context);

    const additionalAuthHeader = context.ctx.res?.getHeader('authorization') as
        | string
        | undefined;
    if (additionalAuthHeader) {
        headers.authorization = additionalAuthHeader;
    }

    const { data, error } = await getApolloClient().query({
        query: GetTenantQuery,
        context: {
            headers,
        },
    });
    const tenant = data?.tenant ?? null;
    if (context.ctx.req) {
        (context.ctx.req as any).tenant = tenant;
    }
    if (!tenant) {
        return {
            pageProps: {
                tenant: null,
                error: error ?? null,
            },
        };
    }
    const { data: userData } = await getApolloClient().query({
        query: GetCurrentUserQuery,
        context: {
            headers,
        },
    });
    const { data: categoriesData } = await getApolloClient().query({
        query: GetCategoriesQuery,
        context: {
            headers,
        },
    });

    return {
        pageProps: {
            tenant,
            currentUser: userData?.currentUser ?? null,
            categories: categoriesData?.categories ?? null,
            error: error ?? null,
            requestBaseUrl: url,
        },
    };
};

const maybeChangeRefreshToken = async (context: AppContext) => {
    console.log('maybeChangeRefreshToken');
    const request = context.ctx.req;
    const response = context.ctx.res;

    if (!request) {
        return;
    }

    const jwt = request.headers.authorization?.replace(/^Bearer /, '');
    console.log({ jwt });
    if (jwt) {
        const decoded = JwtDecode(jwt, { header: false });
        console.log({ decoded });
        const expires = new Date((decoded as any).exp * 1000);
        if (expires.getTime() > new Date().getTime() + 30_000) {
            console.log(
                'token seems legit and does not expire in next 30 seconds'
            );
            // If token seems legit and does not expire in next 30 seconds,
            // keep it and go on.
            // A more thorough validation will be made on API side
            return;
        }
        console.log(
            'token seems to be expired or expires in next 30s- ',
            expires
        );
    }

    if (!response) {
        return;
    }

    const Cookies = (await import('cookies')).default(request, response);
    // Following code executes when there is no (up-to-date)
    // jwt token available on the request Authorization header
    const refreshToken = Cookies.get('SignInRefreshToken');
    console.log({ refreshToken });

    if (!refreshToken) {
        return;
    }

    const decoded = JwtDecode(refreshToken, { header: false });
    const expires = new Date((decoded as any).exp * 1000);
    console.log({ decoded, expires });
    if (expires.getTime() < new Date().getTime() + 10_000) {
        console.log(
            'token has/will expire in next 10 seconds, so dont bother refreshing it, could be too late, let the user just sign in again'
        );
        // token has/will expire in next 10 seconds, so don't
        // bother refreshing it, could be too late, let the
        // user just sign in again
        Cookies.set('SignInRefreshToken', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        return;
    }

    console.log('refreshing token');
    // We made it here so it seems we have a valid refresh token.
    // We'll make an auth token from it and swap the refreshToken
    // in order to authenticate the request
    try {
        const refreshResponse = await axios.request({
            baseURL: process.env.API_URL,
            url: '/auth/token/refresh',
            data: {
                token: refreshToken,
            },
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Forwarded-Host': request.headers.host,
                Accept: 'application/json',
            },
        });
        console.log({ refreshResponse });
        const refreshResponseData = refreshResponse?.data;

        if (refreshResponseData?.accessToken) {
            response.setHeader(
                'authorization',
                `Bearer ${refreshResponseData.accessToken}`
            );
            Cookies.set('AuthToken', refreshResponseData.accessToken, {
                expires: add(new Date(), { minutes: 2 }),
                httpOnly: false,
            });
        }
        const refreshCookieValue =
            refreshResponse?.headers?.['set-cookie']?.[0];

        // set new refresh token on response
        const signInRefreshToken = refreshCookieValue?.match(
            /signinrefreshtoken=(.+);/gi
        )?.[1];
        if (signInRefreshToken) {
            Cookies.set('SignInRefreshToken', signInRefreshToken, {
                httpOnly: true,
                expires,
            });
        }
    } catch (e) {
        console.error('User Token handling eror: ', e);
    } finally {
        return;
    }
};

export default LottaWebApp;
