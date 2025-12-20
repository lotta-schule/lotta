'use client';

import * as React from 'react';
import { t } from 'i18next';
import { ServerDownErrorPage } from 'layout/error/ServerDownErrorPage';
import clsx from 'clsx';

import styles from './_component/AdminPage.module.scss';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className={clsx(styles.root, styles.isRootPage)}>
      <nav>
        <h2>{t('An unexpected error occured')}</h2>
      </nav>
      <div className={clsx(styles.contentSection, styles.takesFullSpace)}>
        <ServerDownErrorPage error={error} />
      </div>
    </div>
  );
}
