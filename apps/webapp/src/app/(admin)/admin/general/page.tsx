import * as React from 'react';
import { GeneralSettings } from './GeneralSettings.js';
import { loadTenant } from '#/loader/index.js';
import { AdminPage } from '#/app/(admin)/admin/_component/AdminPage.js';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { serverTranslations } from '#/i18n/server.js';

async function GeneralSettingsPage() {
  const tenant = await loadTenant();
  const { t } = await serverTranslations();

  return (
    <AdminPage icon={faSliders} title={t('general')} hasHomeLink>
      <GeneralSettings tenant={tenant} />
    </AdminPage>
  );
}

export default GeneralSettingsPage;
