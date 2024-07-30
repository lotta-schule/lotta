import '../styles/globals.scss';

import * as React from 'react';
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

  const origin =
    requestBaseUrl ??
    (typeof globalThis.location !== 'undefined'
      ? globalThis.location.origin
      : `https://${tenant.host}`);

  return (
    <AppContextProviders
      tenant={tenant}
      categories={categories}
      currentUser={currentUser}
      requestBaseUrl={origin}
    >
      <script
        defer
        data-domain={origin.replace(/^https?:\/\/(www\.)?/, '')}
        data-api="/p/e"
        src="/p/script.js"
      ></script>
      <TranslationsProvider>
        <Component {...componentProps} />
      </TranslationsProvider>
    </AppContextProviders>
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
