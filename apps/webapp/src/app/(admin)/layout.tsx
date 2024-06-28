import '../../styles/globals.scss';

import * as React from 'react';
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
import { getBaseUrl, getBaseUrlString } from 'helper';
import { appConfig } from 'config';
import { getAuthTokenFromHeader } from 'api/apollo/client-rsc';
import { TranslationsProvider } from 'i18n/client';
import { TenantGlobalStyleTag } from 'layout/TenantGlobalStyleTag';

export default async function AppLayout({ children }: React.PropsWithChildren) {
  const socketUrl = appConfig.get('API_SOCKET_URL');
  const requestBaseUrl = await getBaseUrlString();
  const accessToken = getAuthTokenFromHeader();

  const tenant = await loadTenant().catch(() => null);

  const origin =
    requestBaseUrl ??
    (typeof globalThis.location !== 'undefined'
      ? globalThis.location.origin
      : `https://${tenant?.host}`);

  const customTheme = tenant?.configuration.customTheme;

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
          <ServerDataContextProvider baseUrl={await getBaseUrl()}>
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
