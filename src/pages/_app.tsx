import * as React from 'react';
import { AppContext, AppProps } from 'next/app';
import { ServerDownError } from 'error/ServerDownError';
import { TenantNotFoundError } from 'error/TenantNotFoundError';
import { getApolloClient } from 'api/client';
import { AppContextProviders } from 'layout/AppContextProviders';
import dynamic from 'next/dynamic';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

import 'index.scss';
import 'nprogress/nprogress.css';
import 'shared/general/button/base-button.scss';
import 'shared/general/button/button.scss';
import 'shared/general/button/button-group.scss';
import 'shared/general/button/navigation-button.scss';

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

export default LottaWebApp;
