import '../styles/globals.scss';
import '../styles/fonts.css';

import * as React from 'react';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import {
  DefaultThemes,
  GlobalStyles,
  HubertProvider,
} from '@lotta-schule/hubert';
import { TenantNotFoundErrorPage } from '#/layout/error/TenantNotFoundErrorPage';
import { loadTenant, loadCategories, loadCurrentUser } from '#/loader';
import { TranslationsProvider } from '#/i18n/client';
import { TenantGlobalStyleTag } from '#/layout/TenantGlobalStyleTag';
import { ServerDataContextProvider } from '#/shared/ServerDataContext';
import {
  getThemeFontPreloadUrls,
  withThemeFontFallbacks,
} from '#/styles/fonts';

faConfig.autoAddCss = false;

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  // Preload the data the nested layouts need so it fetches concurrently with the
  // tenant instead of in a later serial tier. These are `React.cache()`-wrapped,
  // so the awaits in `(default)/layout.tsx` reuse these in-flight requests. The
  // `.catch` keeps the fire-and-forget promises from surfacing as unhandled
  // rejections; the consumers attach their own error handling.
  void loadCategories().catch(() => {});
  void loadCurrentUser().catch(() => {});

  const tenant = await loadTenant().catch(() => null);

  const customTheme = tenant?.configuration.customTheme as
    Record<string, any> | undefined;

  const theme = withThemeFontFallbacks({
    ...DefaultThemes.standard,
    ...customTheme,
  });

  // Fetch the tenant's fonts right away instead of only after the stylesheet
  // has been parsed and the browser found out they are needed.
  // Rendered as plain tags: `ReactDOM.preload` only ends up in the RSC payload
  // here, which is too late to help.
  const fontPreloadUrls = getThemeFontPreloadUrls(theme);

  const allHost = `all.${process.env.NEXT_PUBLIC_BASE_HOST}`;
  const identifier = tenant
    ? `${tenant.slug}.${process.env.NEXT_PUBLIC_BASE_HOST}`
    : '';

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        {fontPreloadUrls.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
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
        <GlobalStyles theme={theme} />
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
