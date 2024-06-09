'use client';

import { memo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FullErrorPage } from './FullErrorPage';

export const ForbiddenErrorPage = memo(() => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/');
    const timeout = setTimeout(() => {
      router.replace('/');
    }, 5000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <FullErrorPage
      title={'Unzureichende Berechtigungen'}
      imageUrl={'/AccessDeniedImage.svg'}
    >
      <p>Du hast nicht die nötigen Berechtigungen, um diese Seite zu sehen.</p>
      <p>Bist du sicher, dass du hier sein solltest?</p>

      <p>Du wirst gleich auf die Startseite weitergeleitet.</p>
    </FullErrorPage>
  );
});
ForbiddenErrorPage.displayName = 'ForbiddenErrorPage';
