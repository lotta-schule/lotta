import * as React from 'react';

import { PageNotFoundErrorPage } from '#/layout/error/PageNotFoundErrorPage.js';
import { AdminPage } from './admin/_component/AdminPage.js';
import { serverTranslations } from '#/i18n/server.js';

export default async function AdminPageNotFound() {
  const { t } = await serverTranslations();
  return (
    <AdminPage hasHomeLink title={t('Page not found')}>
      <PageNotFoundErrorPage />
    </AdminPage>
  );
}
