import * as React from 'react';

import { PageNotFoundErrorPage } from 'layout/error/PageNotFoundErrorPage';
import { AdminPage } from './admin/_component/AdminPage';
import { serverTranslations } from 'i18n/server';

export default async function AdminPageNotFound() {
  const { t } = await serverTranslations();
  return (
    <AdminPage hasHomeLink title={t('Page not found')}>
      <PageNotFoundErrorPage />
    </AdminPage>
  );
}
