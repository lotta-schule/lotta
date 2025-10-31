import * as React from 'react';
import { GeneralSettings } from './GeneralSettings';
import { loadTenant } from 'loader';
import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { serverTranslations } from 'i18n/server';

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
