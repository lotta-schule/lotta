import * as React from 'react';

import { FullErrorPage, SecondaryErrorText } from './FullErrorPage';

export const TenantNotFoundErrorPage = React.memo(() => {
  return (
    <FullErrorPage
      title={'Es gibt kein Lotta unter dieser Adresse'}
      imageUrl={'/TenantNotFoundImage.svg'}
    >
      <p>
        Unter dieser Adresse ist aktuell keine lotta-Plattform zu erreichen.
        Überprüfe die Adresse in der Adressleiste.
      </p>
      <SecondaryErrorText>
        Sie haben Interesse, ein eigenes lotta unter dieser Adresse anzubieten?
        Weitere Informationen gibt es auf{' '}
        <a href="https://lotta.schule" title="Zur Lotta-Projektseite">
          lotta.schule
        </a>
        .
      </SecondaryErrorText>
    </FullErrorPage>
  );
});
TenantNotFoundErrorPage.displayName = 'TenantNotFoundErrorPage';
