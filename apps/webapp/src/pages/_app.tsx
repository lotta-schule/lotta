import '../styles/globals.scss';

import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import { trace } from '@opentelemetry/api';
import { AppContext, AppProps } from 'next/app';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import { ServerDownErrorPage } from 'layout/error/ServerDownErrorPage';
import { TenantNotFoundErrorPage } from 'layout/error/TenantNotFoundErrorPage';
import { getApolloClient } from 'api/legacyClient';
import { AppContextProviders } from 'layout/AppContextProviders';
import { TranslationsProvider } from 'i18n/client';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

faConfig.autoAddCss = false;

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
        query: GetTenantQuery,
        context: {
          headers,
        },
      });
    });

  Sentry.addBreadcrumb({
    type: 'fetchedTenant',
    data: { request: { headers }, result: { data: data?.tenant, error } },
  });

  const tenant = data?.tenant ?? null;

  if (context.ctx.req) {
    (context.ctx.req as any).tenant = tenant;
  }

  if (!tenant) {
    Sentry.captureMessage('Tenant not found', {
      extra: { requestBaseUrl: url },
    });
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
        query: GetCurrentUserQuery,
        context: {
          headers,
        },
      })
    );
  Sentry.addBreadcrumb({
    type: 'gotCurrentUser',
    data: { data: userData, requestHeaders: headers },
  });

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
  Sentry.addBreadcrumb({
    type: 'gotCategoriesData',
    data: { data: categoriesData, requestHeaders: headers },
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
