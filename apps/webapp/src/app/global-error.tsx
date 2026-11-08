'use client'; // Error boundaries must be Client Components

import {
  HubertProvider,
  Button,
  GlobalStyles,
  DefaultThemes,
} from '@lotta-schule/hubert';
import { ServerDownErrorPage } from '#/layout/error/ServerDownErrorPage';
import { withThemeFontFallbacks } from '#/styles/fonts';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <head>
        <GlobalStyles theme={withThemeFontFallbacks(DefaultThemes.standard)} />
      </head>
      <body>
        <HubertProvider>
          <ServerDownErrorPage error={error} />
          <Button onClick={() => reset()}>Seite neu laden</Button>
        </HubertProvider>
      </body>
    </html>
  );
}
