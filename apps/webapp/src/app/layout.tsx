import '../styles/globals.scss';
import '@fortawesome/fontawesome-svg-core/styles.css';

import * as React from 'react';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import {
  DefaultThemes,
  GlobalStyles,
  HubertProvider,
} from '@lotta-schule/hubert';
import { TenantNotFoundErrorPage } from 'layout/error/TenantNotFoundErrorPage';
import { fonts } from 'styles/fonts';
import { loadTenant } from 'loader';
import { TranslationsProvider } from 'i18n/client';
import { TenantGlobalStyleTag } from 'layout/TenantGlobalStyleTag';
import { ServerDataContextProvider } from 'shared/ServerDataContext';

faConfig.autoAddCss = false;

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  const tenant = await loadTenant().catch(() => null);

  const customTheme = tenant?.configuration.customTheme as
    | Record<string, any>
    | undefined;

  const theme = {
    ...DefaultThemes.standard,
    ...customTheme,
  };

  const allHost = `all.${process.env.NEXT_PUBLIC_BASE_HOST}`;
  const identifier = tenant
    ? `${tenant.slug}.${process.env.NEXT_PUBLIC_BASE_HOST}`
    : '';

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="shortcut icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="shortcut icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        {tenant && process.env.NODE_ENV !== 'development' && (
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
        {tenant && <TenantGlobalStyleTag tenant={tenant} />}
        <GlobalStyles theme={theme} supportedFonts={fonts} />
      </head>
      <body>
        <HubertProvider>
          <ServerDataContextProvider tenant={tenant}>
            <TranslationsProvider>
              {tenant ? children : <TenantNotFoundErrorPage />}
            </TranslationsProvider>
          </ServerDataContextProvider>
        </HubertProvider>
      </body>
    </html>
  );
}
