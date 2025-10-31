'use client';

import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@lotta-schule/hubert';
import { t } from 'i18next';
import Link from 'next/link';
import { ServerDownErrorPage } from 'layout/error/ServerDownErrorPage';
import clsx from 'clsx';

import styles from './_component/AdminPage.module.scss';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className={clsx(styles.root, styles.isRootPage)}>
      <div className={clsx(styles.contentSection, styles.takesFullSpace)}>
        <div>
          <ServerDownErrorPage
            title={t('An unexpected error occured')}
            error={error}
          />
        </div>
      </div>
      <div>
        <Button
          component={Link}
          href={'/admin'}
          style={{ width: '20em', margin: '0 auto' }}
        >
          &lt; {t('Back to admin home page')}
        </Button>
      </div>
    </div>
  );
}
