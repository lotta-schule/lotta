import '../../styles/globals.scss';

import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import {
  DefaultThemes,
  GlobalStyles,
  HubertProvider,
} from '@lotta-schule/hubert';
import { TenantNotFoundErrorPage } from 'layout/error/TenantNotFoundErrorPage';
import { fonts } from 'styles/fonts';
import { loadTenant } from 'loader';
import { TenantLayout } from '../../layout/TenantLayout';
import { ApolloProvider } from '../../component/provider/ApolloProvider';
import { ServerDataContextProvider } from 'shared/ServerDataContext';
import { getBaseUrlString } from 'helper';
import { appConfig } from 'config';
import { getAuthTokenFromHeader } from 'api/apollo/client-rsc';
import { TranslationsProvider } from 'i18n/client';
import { TenantGlobalStyleTag } from 'layout/TenantGlobalStyleTag';
import { headers } from 'next/headers';
import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  const traceData = Sentry.getTraceData();
  return {
    other: {
      ...traceData,
    },
  };
}

export default async function AppLayout({ children }: React.PropsWithChildren) {
  const socketUrl = appConfig.get('API_SOCKET_URL');
  const headerValues = await headers();
  const requestBaseUrl = await getBaseUrlString();
  const accessToken = getAuthTokenFromHeader(headerValues);

  const tenant = await loadTenant().catch(() => null);

  const origin =
    requestBaseUrl ??
    (typeof globalThis.location !== 'undefined'
      ? globalThis.location.origin
      : `https://${tenant?.host}`);

  const customTheme = tenant?.configuration.customTheme as
    | Record<string, any>
    | undefined;

  const theme = {
    ...DefaultThemes.standard,
    ...customTheme,
  };

  return (
    <html lang="de">
      <head>
        {tenant && (
          <script
            defer
            data-domain={origin.replace(/^https?:\/\/(www\.)?/, '')}
            data-api="/p/e"
            src="/p/script.js"
          ></script>
        )}
        {tenant && <TenantGlobalStyleTag tenant={tenant} />}
        <GlobalStyles theme={theme} supportedFonts={fonts} />
      </head>
      <body>
        <HubertProvider>
          <ServerDataContextProvider tenant={tenant}>
            <TranslationsProvider>
              {tenant && (
                <ApolloProvider
                  tenant={tenant}
                  socketUrl={socketUrl}
                  accessToken={accessToken ?? undefined}
                >
                  <TenantLayout fullSizeScrollable>{children}</TenantLayout>
                </ApolloProvider>
              )}
              {!tenant && <TenantNotFoundErrorPage />}
            </TranslationsProvider>
          </ServerDataContextProvider>
        </HubertProvider>
      </body>
    </html>
  );
}
