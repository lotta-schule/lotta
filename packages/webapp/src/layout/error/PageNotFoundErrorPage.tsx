import { memo } from 'react';

import { FullErrorPage } from './FullErrorPage';

export const PageNotFoundErrorPage = memo(() => {
  return (
    <FullErrorPage
      title={'Diese Seite existiert nicht'}
      imageUrl={'/RoadSignNotFound.svg'}
    >
      <p>
        Die Seite konnte nicht gefunden werden. Entweder ist die Adresse falsch,
        oder die Seite wurde entfernt.
      </p>
    </FullErrorPage>
  );
});
PageNotFoundErrorPage.displayName = 'PageNotFoundErrorPage';
