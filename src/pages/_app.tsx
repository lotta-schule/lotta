import * as React from 'react';
import { AppContext, AppProps } from 'next/app';
import { ServerDownError } from 'error/ServerDownError';
import { TenantNotFoundError } from 'error/TenantNotFoundError';
import { getApolloClient } from 'api/client';
import { add } from 'date-fns';
import { AppContextProviders } from 'layout/AppContextProviders';
import axios from 'axios';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

import 'index.scss';
import 'nprogress/nprogress.css';
import 'shared/general/button/base-button.scss';
import 'shared/general/button/button.scss';
import 'shared/general/button/button-group.scss';
import 'shared/general/button/navigation-button.scss';
import dynamic from 'next/dynamic';

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

    const headers = context.ctx.req?.headers;

    await maybeChangeRefreshToken(context);
    const { data, error } = await getApolloClient().query({
        query: GetTenantQuery,
        context: {
            headers: {
                ...headers,
                // that's an ugly workaround because before SSR authentication
                // headers were not passed to the GetTenantQuery and I would like
                // to keep it like this for now for simplicity.
                // That's because if  not, the user will always get a "last_seen"
                // value that's from the GetTenantQuery, so just when opening the
                // page, instead of the date of his last visit.
                // This leeds to him not getting the correct count of how much unread
                // messages he got since them, messing it all up.
                authorization: null,
            },
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
    const { data: userTenant, error: userTenantError } =
        await getApolloClient().query({
            query: GetTenantQuery,
            fetchPolicy: 'network-only',
            context: {
                headers: {
                    ...headers,
                    // As the groups are part of the tenant query,
                    // and they are secured by user, we must
                    // fetch it again in order to have the groups
                    // for the user.
                    // TODO: This will have to be implemented on
                    // a better way next time
                },
            },
        });
    const { data: categoriesData } = await getApolloClient().query({
        query: GetCategoriesQuery,
        context: {
            headers,
        },
    });

    if (userTenantError) {
        console.error('Error fetching tenant as user: ', userTenantError);
    }

    return {
        pageProps: {
            tenant: userTenant?.tenant || tenant,
            currentUser: userData?.currentUser ?? null,
            categories: categoriesData?.categories ?? null,
            error: error ?? null,
            requestBaseUrl: url,
        },
    };
};

const maybeChangeRefreshToken = async (context: AppContext) => {
    const request = context.ctx.req;
    const response = context.ctx.res;
    if (!request) {
        return;
    }
    const JwtDecode = (await import('jwt-decode')).default;
    const headers = request.headers as Record<string, string>;
    const jwt = headers.authorization?.replace(/^Bearer /, '');
    if (jwt) {
        const decoded = JwtDecode(jwt, { header: false });
        const expires = new Date((decoded as any).exp * 1000);
        if (expires.getTime() > new Date().getTime() + 30_000) {
            // If token seems legit and does not expire in next 30 seconds,
            // keep it and go on.
            // A more thorough validation will be made on API side
            return;
        }
    }
    if (!response) {
        return;
    }
    const Cookies = (await import('cookies')).default(request, response);
    const refreshToken = Cookies.get('SignInRefreshToken');
    if (!refreshToken) {
        return;
    }
    const decoded = JwtDecode(refreshToken);
    const expires = new Date((decoded as any).exp * 1000);
    if (expires.getTime() < new Date().getTime() + 10_000) {
        // token has/will expire in next 10 seconds, so don't
        // bother refreshing it, could be too late, let the
        // userAvatar just sign in again
        Cookies.set('SignInRefreshToken', null, { httpOnly: true });
        return;
    }
    // We made it here so it seems we have a valid refresh token.
    // We'll make an auth token from it and swap the refreshToken
    // in order to authenticate the request
    try {
        const { data, headers: refreshResponseHeaders } = await axios.request<
            any,
            any,
            any
        >({
            method: 'POST',
            baseURL: process.env.API_URL,
            url: '/auth/token/refresh',
            headers,
        });
        if (data?.accessToken) {
            request.headers.authorization = `Bearer ${data.accessToken}`;
            Cookies.set('AuthToken', data.accessToken, {
                expires: add(new Date(), { minutes: 2 }),
                httpOnly: false,
            });
        }
        const refreshCookie = (
            refreshResponseHeaders['set-cookie'] as unknown as
                | string[]
                | undefined
        )?.find((cookieHeader: string) =>
            /signinrefreshtoken=/i.test(cookieHeader)
        ) as string;
        if (refreshCookie) {
            // set new refresh token on response
            const matches = refreshCookie.match(/signinrefreshtoken=(.+);/gi);
            const value = matches?.[1];
            if (value) {
                Cookies.set('SignInRefreshToken', value, {
                    httpOnly: true,
                    expires,
                });
            }
        }
    } catch (e) {
        console.error('User Token handling eror: ', e);
    }
};

export default LottaWebApp;
