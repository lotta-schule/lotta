import '../styles/globals.scss';

import * as React from 'react';
import { trace } from '@opentelemetry/api';
import { AppContext, AppProps } from 'next/app';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import { ServerDownErrorPage } from 'layout/error/ServerDownErrorPage';
import { TenantNotFoundErrorPage } from 'layout/error/TenantNotFoundErrorPage';
import { getApolloClient } from 'api/legacyClient';
import { AppContextProviders } from 'layout/AppContextProviders';
import { TranslationsProvider } from 'i18n/client';
import { GET_TENANT_QUERY } from 'util/tenant';
import { GET_CURRENT_USER } from 'util/user/useCurrentUser';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

faConfig.autoAddCss = false;

const LottaWebApp = ({
  Component,
  pageProps: {
    categories,
    currentUser,
    error,
    requestBaseUrl,
    socketUrl,
    tenant,
    ...componentProps
  },
}: AppProps) => {
  if (error) {
    return <ServerDownErrorPage error={error} />;
  }

  if (!tenant) {
    return <TenantNotFoundErrorPage />;
  }

  const allHost = `all.${process.env.NEXT_PUBLIC_BASE_HOST}`;
  const identifier = `${tenant.slug}.${process.env.NEXT_PUBLIC_BASE_HOST}`;
  const origin =
    requestBaseUrl ??
    (typeof globalThis.location !== 'undefined'
      ? globalThis.location.origin
      : `https://${tenant.host}`);

  return (
    <>
      {process.env.NODE_ENV !== 'development' && (
        <>
          <script
            defer
            data-domain={identifier}
            data-api="/p/e"
            src="/p/script.js"
          ></script>
          <script
            defer
            data-domain={allHost}
            data-api="/p/e"
            src="/p/script.js"
          ></script>
        </>
      )}
      <AppContextProviders
        tenant={tenant}
        socketUrl={socketUrl}
        categories={categories}
        currentUser={currentUser}
        requestBaseUrl={origin}
      >
        <TranslationsProvider>
          <Component {...componentProps} />
        </TranslationsProvider>
      </AppContextProviders>
    </>
  );
};

LottaWebApp.getInitialProps = async (context: AppContext) => {
  const getProtocol = () => {
    if (!context.ctx.req) {
      return 'http';
    }
    const proto =
      (context.ctx.req.headers['x-forwarded-proto'] as string | undefined) ||
      ((context.ctx.req.connection as any).encrypted ? 'https' : 'http');
    return proto.split(/\s*,\s*/)[0];
  };

  const url =
    process.env.FORCE_BASE_URL ??
    (context.ctx.req && `${getProtocol()}://${context.ctx.req.headers.host}`);

  const headers = context.ctx.req?.headers ?? {};

  const { data, error } = await trace
    .getTracer('lotta-web')
    .startActiveSpan('fetchTenant', async () => {
      return await getApolloClient().query({
        query: GET_TENANT_QUERY,
        context: {
          headers,
        },
      });
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

  const { data: userData } = await trace
    .getTracer('lotta-web')
    .startActiveSpan('getcurrentUser', async () =>
      getApolloClient().query({
        query: GET_CURRENT_USER,
        context: {
          headers,
        },
      })
    );

  const { data: categoriesData } = await trace
    .getTracer('lotta-web')
    .startActiveSpan('getcurrentUser', async () =>
      getApolloClient().query({
        query: GetCategoriesQuery,
        context: {
          headers,
        },
      })
    );

  return {
    pageProps: {
      tenant,
      currentUser: userData?.currentUser ?? null,
      categories: categoriesData?.categories ?? null,
      error: error ?? null,
      requestBaseUrl: url,
      socketUrl: process.env.API_SOCKET_URL,
    },
  };
};

export default LottaWebApp;
