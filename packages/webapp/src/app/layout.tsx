import '../styles/globals.scss';

import * as React from 'react';
import {
  DefaultThemes,
  GlobalStyles,
  HubertProvider,
} from '@lotta-schule/hubert';
import { TenantNotFoundError } from 'error/TenantNotFoundError';
import { fonts } from './admin/system/presentation/fonts';
import { loadTenant } from '../loader/loadTenant';
import { TenantLayout } from '../layout/TenantLayout';
import { ApolloProvider } from '../component/provider/ApolloProvider';
import { ServerDataContextProvider } from 'shared/ServerDataContext';
import { getBaseUrl, getBaseUrlString } from 'helper';
import { appConfig } from 'config';
import { getAuthTokenFromHeader } from 'api/apollo/client-rsc';

export const dynamic = 'force-dynamic';

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
      </head>
      <body>
        <HubertProvider>
          <ServerDataContextProvider baseUrl={await getBaseUrl()}>
            {tenant && (
              <ApolloProvider
                tenant={tenant}
                socketUrl={socketUrl}
                accessToken={accessToken ?? undefined}
              >
                <TenantLayout>{children}</TenantLayout>
              </ApolloProvider>
            )}
            {!tenant && <TenantNotFoundError />}
            <GlobalStyles theme={theme} supportedFonts={fonts} />
          </ServerDataContextProvider>
        </HubertProvider>
        <div id={'dialogContainer'} />
      </body>
    </html>
  );
}
