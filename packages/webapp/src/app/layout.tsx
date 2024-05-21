import '../styles/globals.scss';

import * as React from 'react';
import { DefaultThemes, GlobalStyles } from '@lotta-schule/hubert';
import { fonts } from 'administration/system/presentation/fonts';
import { TenantNotFoundError } from 'error/TenantNotFoundError';
import { loadTenant } from '../loader/loadTenant';
import { TenantLayout } from '../layout/TenantLayout';
import { ApolloProvider } from '../component/provider/ApolloProvider';

// TODO: Remove this once we have a proper solution for this
const requestBaseUrl = 'https://ehrenberg.lotta.schule';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: React.PropsWithChildren) {
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
        {tenant && (
          <ApolloProvider tenant={tenant}>
            <TenantLayout>{children}</TenantLayout>
          </ApolloProvider>
        )}
        {!tenant && <TenantNotFoundError />}
        <GlobalStyles theme={theme} supportedFonts={fonts} />
      </body>
    </html>
  );
}
