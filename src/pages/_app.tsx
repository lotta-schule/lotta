import type { AppContext, AppProps } from 'next/app';
import * as React from 'react';
import { ApolloProvider } from '@apollo/client';
import { CloudimageProvider } from 'react-cloudimage-responsive';
import { I18nextProvider } from 'react-i18next';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ThemeProvider } from '@material-ui/styles';
import { de } from 'date-fns/locale';
import { App } from 'component/App';
import { Authentication } from 'component/Authentication';
import { ServerDownError } from 'component/ServerDownError';
import { TenantNotFoundError } from 'component/TenantNotFoundError';
import { UploadQueueProvider } from 'component/fileExplorer/context/UploadQueueContext';
import { getApolloClient } from 'api/client';
import { i18n } from '../i18n';
import { theme } from 'theme';
import { add } from 'date-fns';
import { ServerDataContextProvider } from 'component/ServerDataContext';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';
import axios from 'axios';
import DateFnsUtils from '@date-io/date-fns';
import Head from 'next/head';
import getConfig from 'next/config';

import 'index.scss';
import 'component/general/button/base-button.scss';
import 'component/general/button/button.scss';
import 'component/general/button/button-group.scss';
import 'component/general/button/navigation-button.scss';
import { OverlayProvider } from '@react-aria/overlays';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

const LottaWebApp = ({ Component, pageProps }: AppProps) => {
    const firstBrowserInit = React.useRef(false);

    const {
        error,
        tenant,
        categories,
        currentUser,
        requestBaseUrl,
        ...componentProps
    } = pageProps;

    if (error) {
        return <ServerDownError error={error} />;
    }

    if (!tenant) {
        return <TenantNotFoundError />;
    }

    const client = getApolloClient();
    if (!firstBrowserInit.current) {
        client.writeQuery({
            query: GetTenantQuery,
            data: { tenant },
        });
        if (categories) {
            client.writeQuery({
                query: GetCategoriesQuery,
                data: { categories },
            });
        }
        if (currentUser) {
            client.writeQuery({
                query: GetCurrentUserQuery,
                data: { currentUser },
            });
        }
        if (typeof window !== 'undefined') {
            const authToken = document.cookie.match(/AuthToken=(.+);?/i)?.[1];
            if (authToken) {
                localStorage.setItem('id', authToken);
            }
        }
        firstBrowserInit.current = true;
    }

    const baseUrl =
        typeof window === undefined
            ? requestBaseUrl
            : requestBaseUrl ?? window.location.origin;
    return (
        <ServerDataContextProvider value={{ baseUrl }}>
            <ApolloProvider client={client}>
                <ThemeProvider theme={theme}>
                    <I18nextProvider i18n={i18n}>
                        <MuiPickersUtilsProvider
                            utils={DateFnsUtils}
                            locale={de}
                        >
                            <CloudimageProvider
                                config={{
                                    token: cloudimageToken,
                                }}
                            >
                                <OverlayProvider>
                                    <Authentication>
                                        <UploadQueueProvider>
                                            <Head>
                                                <meta charSet="utf-8" />
                                                <meta
                                                    name="viewport"
                                                    content="width=device-width, initial-scale=1"
                                                />
                                            </Head>
                                            <App tenant={tenant}>
                                                <Component
                                                    {...componentProps}
                                                />
                                            </App>
                                        </UploadQueueProvider>
                                    </Authentication>
                                </OverlayProvider>
                            </CloudimageProvider>
                        </MuiPickersUtilsProvider>
                    </I18nextProvider>
                </ThemeProvider>
            </ApolloProvider>
        </ServerDataContextProvider>
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

    await maybeChangeRefreshToken(context);
    const { data, error } = await getApolloClient().query({
        query: GetTenantQuery,
        context: {
            headers: context.ctx.req?.headers,
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
            headers: context.ctx.req?.headers,
        },
    });
    const { data: categoriesData } = await getApolloClient().query({
        query: GetCategoriesQuery,
        context: {
            headers: context.ctx.req?.headers,
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
    const request = context.ctx.req;
    const response = context.ctx.res;
    if (!request) {
        return;
    }
    const JwtDecode = (await import('jwt-decode')).default;
    const headers = request.headers;
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
        // user just sign in again
        Cookies.set('SignInRefreshToken', null, { httpOnly: true });
        return;
    }
    // We made it here so it seems we have a valid refresh token.
    // We'll make an auth token from it and swap the refreshToken
    // in order to authenticate the request
    try {
        const { data, headers: refreshResponseHeaders } =
            await axios.request<any>({
                method: 'POST',
                baseURL: process.env.API_URL,
                url: '/auth/token/refresh',
                headers: request.headers as Record<string, string>,
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
        console.error(e);
    }
};

export default LottaWebApp;
