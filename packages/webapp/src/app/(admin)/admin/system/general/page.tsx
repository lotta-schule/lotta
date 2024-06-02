import * as React from 'react';
import { GeneralSettings } from './GeneralSettings';
import { loadTenant } from 'loader';
import { getBaseUrl } from 'helper';
import { AdminPage } from 'app/(admin)/admin/_component/AdminPage';
import { faSliders } from '@fortawesome/free-solid-svg-icons';

async function GeneralSettingsPage() {
  const tenant = await loadTenant();
  const baseUrl = await getBaseUrl();

  return (
    <AdminPage icon={faSliders} title="Grundeinstellungen" hasHomeLink>
      <GeneralSettings tenant={tenant} baseUrl={baseUrl} />
    </AdminPage>
  );
}

export default GeneralSettingsPage;
