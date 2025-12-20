'use client'; // Error boundaries must be Client Components

import * as React from 'react';
import {
  HubertProvider,
  Button,
  GlobalStyles,
  DefaultThemes,
} from '@lotta-schule/hubert';
import { ServerDownErrorPage } from 'layout/error/ServerDownErrorPage';

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
        <GlobalStyles theme={DefaultThemes.standard} />
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
